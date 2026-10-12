import type { ProviderCategory } from "../providers";

export interface CreateLeadInput {
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  citySlug: string;
  headcount: number;
  function: string;
  category: ProviderCategory;
  timeline: string;
  note?: string | null;
  chosenProviderSlugs?: string[];
}

export interface CreateLeadResult {
  leadId: string;
  offersCreated: number;
  offeredProviderSlugs: string[];
  status: "matched" | "unmatched";
}

export type OfferStatus =
  | "offered"
  | "accepted"
  | "declined"
  | "expired"
  | "refunded";

export interface ProviderOffer {
  id: string;
  leadId: string;
  providerSlug: string;
  status: OfferStatus;
  offeredAt: string;
  resolvedAt: string | null;
  category: ProviderCategory;
  citySlug: string;
  headcount: number;
  function: string;
  timeline: string;
  note: string | null;
  buyerCompany: string;
  buyerName: string;
  buyerEmail: string | null;
  isExpired: boolean;
  canRefund: boolean;
}

export interface LedgerEntry {
  id: string;
  providerSlug: string;
  delta: number;
  reason: "demo_grant" | "demo_topup" | "lead_accepted" | "refund_invalid";
  leadOfferId: string | null;
  createdAt: string;
}
