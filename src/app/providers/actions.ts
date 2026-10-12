"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { claimProvider } from "@/modules/providers";
import { setDemoSession, requireRole, UnauthorizedError } from "@/modules/auth";

const claimSchema = z.object({
  slug: z.string().min(1),
});

export type ClaimActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server action to claim a provider profile.
 * Requires the demo session to be a provider matching the target slug.
 */
export async function claimProviderAction(
  formData: FormData
): Promise<ClaimActionResult> {
  const rawSlug = formData.get("slug");
  const parsed = claimSchema.safeParse({ slug: rawSlug });

  if (!parsed.success) {
    return { success: false, error: "Invalid provider slug." };
  }

  const { slug } = parsed.data;

  try {
    // 1. Enforce role guard
    await requireRole("provider", { providerSlug: slug });

    // 2. Perform idempotent claim
    await claimProvider(slug);

    // 3. Revalidate paths
    revalidatePath("/providers");
    revalidatePath(`/providers/${slug}`);

    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to claim provider.",
    };
  }
}

/**
 * Demo helper action: switches demo session to this provider and claims the profile.
 * Useful when testing the claim flow directly from the profile page.
 */
export async function demoSwitchAndClaimAction(
  slug: string
): Promise<ClaimActionResult> {
  const parsed = claimSchema.safeParse({ slug });
  if (!parsed.success) {
    return { success: false, error: "Invalid provider slug." };
  }

  try {
    // 1. Switch demo session to this provider
    await setDemoSession({
      role: "provider",
      providerSlug: parsed.data.slug,
    });

    // 2. Perform idempotent claim
    await claimProvider(parsed.data.slug);

    // 3. Revalidate paths
    revalidatePath("/", "layout");
    revalidatePath("/providers");
    revalidatePath(`/providers/${parsed.data.slug}`);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to claim provider.",
    };
  }
}
