import React from "react";
import Link from "next/link";
import { Coins, ShieldCheck } from "lucide-react";
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
      <div className="space-y-6 relative">
        <div
          className="ambient-glow-teal -top-24 -right-16 w-80 h-80 opacity-40 pointer-events-none"
          aria-hidden="true"
        />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle text-accent border border-accent/20 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Lead Routing Portal &middot; Demo Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
            Provider Inbox
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
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
    <div className="space-y-8 relative">
      {/* Subtle Ambient Background Texture */}
      <div
        className="ambient-glow-teal -top-24 -right-16 w-80 h-80 opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Persistent notice per ADR 006 */}
      <div
        role="note"
        className="p-4 rounded-2xl border border-accent/20 bg-accent-subtle text-xs text-accent flex items-center justify-between shadow-subtle flex-wrap gap-2"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-medium">Prototype: nothing is sent to anyone.</span>
        </div>
        <span className="text-[11px] text-text-muted bg-surface px-3 py-1 rounded-full border border-border">
          Active Provider: {provider?.name ?? providerSlug}
        </span>
      </div>

      {/* Header & Balance Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-border/80">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
            Provider Inbox
          </h1>
          <div className="text-xs sm:text-sm text-text-muted">
            Managing leads for{" "}
            <Link
              href={`/providers/${providerSlug}`}
              className="text-teal-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>{provider?.name ?? providerSlug}</span>
            </Link>
          </div>
        </div>

        {/* Credit Wallet Widget */}
        <div className="rounded-2xl bg-surface border border-border shadow-elevated p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-accent" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
              <span>Available credits</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-emerald-700 font-medium">Live</span>
            </div>
            <div
              data-testid="credit-balance"
              className="text-xl font-bold font-mono text-text tabular-nums"
            >
              {currentBalance}{" "}
              <span className="text-xs font-normal text-text-muted font-sans">
                {currentBalance === 1 ? "credit" : "credits"}
              </span>
            </div>
            <div className="text-[10px] text-text-muted">
              1 credit unlocks 1 verified lead intro
            </div>
          </div>
          <div className="pl-3 sm:pl-4 border-l border-border">
            <DemoTopUpButton providerSlug={providerSlug} />
          </div>
        </div>
      </div>

      {/* Offers Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-text">
            Lead offers ({offers.length})
          </h2>
          <span className="text-[11px] text-text-muted bg-surface-raised px-2.5 py-0.5 rounded-full border border-border">
            1 credit per accepted lead &middot; 72h validity
          </span>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-subtle">
            <p className="text-xs text-text-muted">No lead offers in your inbox.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                data-testid={`offer-card-${offer.id}`}
                className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-subtle hover:shadow-elevated transition-all"
              >
                {/* Offer Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-text flex items-center gap-2">
                      <span>{offer.buyerCompany}</span>
                      <span className="text-text-muted">&middot;</span>
                      <span className="text-text-muted capitalize font-normal">
                        {offer.citySlug}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Offered on {new Date(offer.offeredAt).toISOString().split("T")[0]}
                    </div>
                  </div>

                  <div>
                    {offer.status === "offered" && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Offered (Active)</span>
                      </span>
                    )}
                    {offer.status === "accepted" && (
                      <span
                        data-testid="status-accepted"
                        className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Accepted</span>
                      </span>
                    )}
                    {offer.status === "declined" && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span>Declined</span>
                      </span>
                    )}
                    {offer.status === "expired" && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span>Expired</span>
                      </span>
                    )}
                    {offer.status === "refunded" && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        <span>Refunded (+1 credit)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Offer Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-surface-raised p-4 rounded-xl border border-border">
                  <div>
                    <span className="text-[11px] text-text-muted block">Headcount</span>
                    <span className="font-semibold text-text">{offer.headcount} seats</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-muted block">Function</span>
                    <span className="font-semibold text-text capitalize">
                      {offer.function.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-muted block">Category</span>
                    <span className="font-semibold text-text capitalize">
                      {offer.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-muted block">Timeline</span>
                    <span className="font-semibold text-text capitalize">
                      {offer.timeline.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {offer.note && (
                  <p className="text-xs text-text-muted leading-relaxed italic bg-background p-3 rounded-xl border border-border/60">
                    &ldquo;{offer.note}&rdquo;
                  </p>
                )}

                {/* Buyer Contact Reveal Box */}
                <div className="pt-2">
                  {offer.buyerEmail ? (
                    <div
                      data-testid="buyer-contact-revealed"
                      className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-text space-y-1.5"
                    >
                      <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>Verified Buyer Contact:</span>
                      </div>
                      <div className="text-xs">
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
                      className="p-3.5 rounded-xl bg-surface-raised border border-border text-xs text-text-muted italic"
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
          <h2 className="text-sm font-semibold tracking-tight text-text">
            Credit ledger
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5">
            Append-only audit trail of credit disbursements, accepted leads, and refunds.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-subtle overflow-hidden">
          <LedgerTable entries={ledgerEntries} />
        </div>
      </div>
    </div>
  );
}
