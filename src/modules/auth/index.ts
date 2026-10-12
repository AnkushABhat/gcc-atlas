import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

export type Role = "buyer" | "provider" | "admin";

export interface Session {
  role: Role;
  providerSlug?: string;
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

const COOKIE_NAME = "gcc_atlas_demo_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-key-gcc-atlas";

const sessionPayloadSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("buyer"),
  }),
  z.object({
    role: z.literal("provider"),
    providerSlug: z.string().min(1),
  }),
  z.object({
    role: z.literal("admin"),
  }),
]);

function signPayload(payloadJson: string): string {
  const hmac = createHmac("sha256", SESSION_SECRET);
  hmac.update(payloadJson);
  return hmac.digest("hex");
}

function verifySignature(payloadJson: string, signature: string): boolean {
  const expected = signPayload(payloadJson);
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Reads and verifies the demo session from cookies.
 * Falls back to { role: "buyer" } if missing, unsigned, or tampered per ADR 006.
 */
export async function getSession(): Promise<Session> {
  try {
    const cookieStore = await cookies();
    const rawValue = cookieStore.get(COOKIE_NAME)?.value;

    if (!rawValue) {
      return { role: "buyer" };
    }

    const dotIndex = rawValue.lastIndexOf(".");
    if (dotIndex === -1) {
      return { role: "buyer" };
    }

    const encodedPayload = rawValue.slice(0, dotIndex);
    const signature = rawValue.slice(dotIndex + 1);

    const payloadJson = Buffer.from(encodedPayload, "base64url").toString("utf-8");

    if (!verifySignature(payloadJson, signature)) {
      return { role: "buyer" };
    }

    const parsed = sessionPayloadSchema.safeParse(JSON.parse(payloadJson));
    if (!parsed.success) {
      return { role: "buyer" };
    }

    return parsed.data;
  } catch {
    return { role: "buyer" };
  }
}

/**
 * Sets the signed demo session cookie.
 */
export async function setDemoSession(session: Session): Promise<void> {
  const validated = sessionPayloadSchema.parse(session);
  const payloadJson = JSON.stringify(validated);
  const encodedPayload = Buffer.from(payloadJson, "utf-8").toString("base64url");
  const signature = signPayload(payloadJson);
  const cookieValue = `${encodedPayload}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears the demo session cookie, reverting to default buyer role.
 */
export async function clearDemoSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Guard for server actions and protected views.
 * Throws UnauthorizedError if current session does not match required role or provider slug.
 */
export async function requireRole(
  role: Role,
  options?: { providerSlug?: string }
): Promise<Session> {
  const session = await getSession();

  if (session.role !== role) {
    throw new UnauthorizedError(
      `Access denied: required role is '${role}', current session role is '${session.role}'`
    );
  }

  if (role === "provider" && options?.providerSlug) {
    if (session.providerSlug !== options.providerSlug) {
      throw new UnauthorizedError(
        `Access denied: session provider '${session.providerSlug}' does not match required '${options.providerSlug}'`
      );
    }
  }

  return session;
}
