"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { setDemoSession, clearDemoSession, type Role } from "@/modules/auth";

const switchRoleSchema = z.object({
  role: z.enum(["buyer", "provider", "admin"]),
  providerSlug: z.string().optional(),
});

export async function switchDemoRoleAction(formData: FormData) {
  const role = formData.get("role") as Role;
  const providerSlug = (formData.get("providerSlug") as string) || undefined;

  const parsed = switchRoleSchema.safeParse({ role, providerSlug });
  if (!parsed.success) {
    return { success: false, error: "Invalid role payload" };
  }

  if (parsed.data.role === "buyer") {
    await clearDemoSession();
  } else if (parsed.data.role === "provider") {
    if (!parsed.data.providerSlug) {
      return { success: false, error: "Provider selection required" };
    }
    await setDemoSession({
      role: "provider",
      providerSlug: parsed.data.providerSlug,
    });
  } else {
    await setDemoSession({ role: "admin" });
  }

  revalidatePath("/", "layout");
  return { success: true };
}
