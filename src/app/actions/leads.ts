"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createLead,
  acceptOffer,
  declineOffer,
  flagInvalid,
  demoTopUp,
  type CreateLeadResult,
} from "@/modules/leads";
import { PROVIDER_CATEGORIES, type ProviderCategory } from "@/modules/providers";

const introRequestSchema = z.object({
  buyerName: z.string().trim().min(2, "Buyer name is required"),
  buyerCompany: z.string().trim().min(2, "Company name is required"),
  buyerEmail: z.string().trim().email("Valid work email is required"),
  citySlug: z.string().trim().min(1, "Target city is required"),
  headcount: z.coerce.number().int().positive("Headcount must be a positive number"),
  function: z.string().trim().min(1, "Primary function is required"),
  category: z.enum(PROVIDER_CATEGORIES, {
    errorMap: () => ({ message: "Valid provider category is required" }),
  }),
  timeline: z.string().trim().min(1, "Timeline is required"),
  note: z.string().trim().optional(),
  chosenProviderSlug: z.string().trim().optional(),
});

export type SubmitIntroResult =
  | { success: true; data: CreateLeadResult }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitIntroRequestAction(
  formData: FormData
): Promise<SubmitIntroResult> {
  const rawData = {
    buyerName: formData.get("buyerName"),
    buyerCompany: formData.get("buyerCompany"),
    buyerEmail: formData.get("buyerEmail"),
    citySlug: formData.get("citySlug"),
    headcount: formData.get("headcount"),
    function: formData.get("function"),
    category: formData.get("category"),
    timeline: formData.get("timeline"),
    note: formData.get("note") || undefined,
    chosenProviderSlug: formData.get("chosenProviderSlug") || undefined,
  };

  const parsed = introRequestSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstErrorMessage =
      Object.values(fieldErrors).flat()[0] || "Invalid submission data.";
    return { success: false, error: firstErrorMessage, fieldErrors };
  }

  try {
    const { chosenProviderSlug, ...rest } = parsed.data;
    const result = await createLead({
      ...rest,
      category: rest.category as ProviderCategory,
      chosenProviderSlugs: chosenProviderSlug ? [chosenProviderSlug] : undefined,
    });

    revalidatePath("/inbox");
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create intro request.",
    };
  }
}

export type ActionStatus =
  | { success: true }
  | { success: false; error: string };

export async function acceptOfferAction(
  offerId: string,
  providerSlug: string
): Promise<ActionStatus> {
  try {
    await acceptOffer(offerId, providerSlug);
    revalidatePath("/inbox");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to accept offer.",
    };
  }
}

export async function declineOfferAction(
  offerId: string,
  providerSlug: string
): Promise<ActionStatus> {
  try {
    await declineOffer(offerId, providerSlug);
    revalidatePath("/inbox");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to decline offer.",
    };
  }
}

export async function flagInvalidAction(
  offerId: string,
  providerSlug: string
): Promise<ActionStatus> {
  try {
    await flagInvalid(offerId, providerSlug);
    revalidatePath("/inbox");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to request refund.",
    };
  }
}

export async function demoTopUpAction(
  providerSlug: string
): Promise<ActionStatus> {
  try {
    await demoTopUp(providerSlug);
    revalidatePath("/inbox");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to top up demo credits.",
    };
  }
}
