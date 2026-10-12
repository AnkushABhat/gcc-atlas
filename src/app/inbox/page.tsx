import React from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { getSession } from "@/modules/auth";
import { getProvider, listProviders } from "@/modules/providers";
import {
  listOffersForProvider,
  balance,
  ledger,
} from "@/modules/leads";
import {
  DemoTopUpButton,
  OfferActionButtons,
  SwitchProviderHelper,
  LedgerTable,
} from "./inbox-client";

export const metadata = {
  title: "Provider Inbox — GCC Atlas",
  description: "Provider lead inbox, offer management, and credit ledger.",
};

export default async function InboxPage() {
  const session = await getSession();

  if (session.role !== "provider" || !session.providerSlug) {
    const allProviders = await listProviders();
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text">
            Provider Inbox
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Review incoming qualified GCC setup leads, accept offers, and manage credits.
          </p>
        </div>

        <SwitchProviderHelper
          providers={allProviders.map((p) => ({
            slug: p.slug,
            name: p.name,
          }))}
        />
      </div>
    );
  }

  const providerSlug = session.providerSlug;

  const [provider, currentBalance, offers, ledgerEntries] = await Promise.all([
    getProvider(providerSlug),
    balance(providerSlug),
    listOffersForProvider(providerSlug),
    ledger(providerSlug),
  ]);

  return (
    <div className="space-y-8">
      {/* Persistent notice per ADR 006 */}
      <div
        role="note"
        className="p-3.5 rounded-lg border border-border bg-accent-subtle text-xs text-accent flex items-center justify-between"
      >
        <span>Prototype: nothing is sent to anyone.</span>
        <span className="text-[11px] text-text-muted">
          Active Provider: {provider?.name ?? providerSlug}
        </span>
      </div>

      {/* Header & Balance Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-text">
            Provider Inbox
          </h1>
          <div className="text-xs text-text-muted mt-1">
            Managing leads for{" "}
            <Link
              href={`/providers/${providerSlug}`}
              className="text-teal-primary font-medium hover:underline"
            >
              {provider?.name ?? providerSlug}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3.5 bg-surface p-3.5 rounded-lg border border-border">
          <div className="w-10 h-10 rounded-md bg-accent-subtle text-accent border border-border flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-text-muted font-medium">
              Available credits
            </div>
            <div
              data-testid="credit-balance"
              className="text-lg font-medium font-mono text-text tabular-nums"
            >
              {currentBalance}{" "}
              <span className="text-xs font-normal text-text-muted">
                {currentBalance === 1 ? "credit" : "credits"}
              </span>
            </div>
          </div>
          <div className="pl-3 border-l border-border">
            <DemoTopUpButton providerSlug={providerSlug} />
          </div>
        </div>
      </div>

      {/* Offers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-tight text-text">
            Lead offers ({offers.length})
          </h2>
          <span className="text-[11px] text-text-muted">
            1 credit per accepted lead &middot; 72h validity
          </span>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-12 text-center">
            <p className="text-xs text-text-muted">No lead offers in your inbox.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                data-testid={`offer-card-${offer.id}`}
                className="rounded-lg border border-border bg-surface p-5 space-y-4"
              >
                {/* Offer Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-text flex items-center gap-2">
                      <span>{offer.buyerCompany}</span>
                      <span className="text-text-muted">&middot;</span>
                      <span className="text-text-muted capitalize">
                        {offer.citySlug}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Offered on {new Date(offer.offeredAt).toISOString().split("T")[0]}
                    </div>
                  </div>

                  <div>
                    {offer.status === "offered" && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Offered (Active)</span>
                      </span>
                    )}
                    {offer.status === "accepted" && (
                      <span
                        data-testid="status-accepted"
                        className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Accepted</span>
                      </span>
                    )}
                    {offer.status === "declined" && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span>Declined</span>
                      </span>
                    )}
                    {offer.status === "expired" && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span>Expired</span>
                      </span>
                    )}
                    {offer.status === "refunded" && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        <span>Refunded (+1 credit)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Offer Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-background p-3 rounded border border-border">
                  <div>
                    <span className="text-[11px] text-text-muted block">Headcount</span>
                    <span className="font-medium text-text">{offer.headcount} seats</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-muted block">Function</span>
                    <span className="font-medium text-text capitalize">
                      {offer.function.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-muted block">Category</span>
                    <span className="font-medium text-text capitalize">
                      {offer.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-muted block">Timeline</span>
                    <span className="font-medium text-text capitalize">
                      {offer.timeline.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {offer.note && (
                  <p className="text-xs text-text-secondary leading-relaxed italic">
                    &ldquo;{offer.note}&rdquo;
                  </p>
                )}

                {/* Buyer Contact Reveal Box */}
                <div className="pt-2">
                  {offer.buyerEmail ? (
                    <div
                      data-testid="buyer-contact-revealed"
                      className="p-3 rounded bg-emerald-50/60 border border-emerald-200 text-xs text-text space-y-1"
                    >
                      <div className="font-medium text-emerald-900">
                        Verified Buyer Contact:
                      </div>
                      <div>
                        <strong>{offer.buyerName}</strong> &middot;{" "}
                        <a
                          href={`mailto:${offer.buyerEmail}`}
                          className="text-teal-primary font-mono font-medium hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                        >
                          {offer.buyerEmail}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div
                      data-testid="buyer-contact-hidden"
                      className="p-3 rounded bg-background border border-border text-xs text-text-muted italic"
                    >
                      Contact hidden until accepted. Spend 1 credit to reveal full buyer contact details.
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex justify-end">
                  <OfferActionButtons
                    offerId={offer.id}
                    providerSlug={providerSlug}
                    status={offer.status}
                    canRefund={offer.canRefund}
                    creditBalance={currentBalance}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credit Ledger Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h2 className="text-sm font-medium tracking-tight text-text">
            Credit ledger
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5">
            Append-only audit trail of credit disbursements, accepted leads, and refunds.
          </p>
        </div>

        <LedgerTable entries={ledgerEntries} />
      </div>
    </div>
  );
}
