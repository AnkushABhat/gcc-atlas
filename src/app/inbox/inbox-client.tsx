"use client";

import React, { useTransition, useState } from "react";
import {
  acceptOfferAction,
  declineOfferAction,
  flagInvalidAction,
  demoTopUpAction,
} from "@/app/actions/leads";
import { switchDemoRoleAction } from "@/app/actions/auth";
import { DataTable, type Column } from "@/components";
import type { LedgerEntry } from "@/modules/leads";

const REASON_LABELS: Record<string, string> = {
  demo_grant: "Initial Demo Grant",
  demo_topup: "Demo Credit Top-up",
  lead_accepted: "Lead Introduction Accepted",
  refund_invalid: "Invalid Lead Refund",
};

export function LedgerTable({ entries }: { entries: LedgerEntry[] }) {
  const ledgerColumns: Column<LedgerEntry>[] = [
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      sortFn: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      className: "font-mono text-xs text-text-muted whitespace-nowrap",
      accessor: (entry) =>
        new Date(entry.createdAt).toISOString().split("T")[0],
    },
    {
      key: "reason",
      header: "Description",
      sortable: true,
      className: "text-text font-medium text-xs",
      accessor: (entry) => REASON_LABELS[entry.reason] || entry.reason,
    },
    {
      key: "delta",
      header: "Delta",
      sortable: true,
      sortFn: (a, b) => a.delta - b.delta,
      className: "font-mono font-medium",
      accessor: (entry) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${
            entry.delta > 0
              ? "text-success font-semibold"
              : "text-error font-semibold"
          }`}
        >
          {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
        </span>
      ),
    },
    {
      key: "leadOfferId",
      header: "Offer ref",
      className: "font-mono text-[11px] text-text-muted",
      accessor: (entry) =>
        entry.leadOfferId ? entry.leadOfferId.slice(0, 8) : "—",
    },
  ];

  return (
    <DataTable
      columns={ledgerColumns}
      data={entries}
      keyExtractor={(entry) => entry.id}
      defaultSortKey="createdAt"
      defaultSortDirection="desc"
      ariaLabel="Credit ledger transactions"
      emptyState={{
        title: "No transactions recorded.",
        description:
          "Transactions will appear here as leads are accepted or credits granted.",
      }}
    />
  );
}

export function DemoTopUpButton({ providerSlug }: { providerSlug: string }) {
  const [isPending, startTransition] = useTransition();

  const handleTopUp = () => {
    startTransition(async () => {
      await demoTopUpAction(providerSlug);
    });
  };

  return (
    <button
      type="button"
      onClick={handleTopUp}
      disabled={isPending}
      className="inline-flex items-center px-4 py-2 rounded-xl bg-teal-primary text-white text-xs font-medium hover:bg-teal-hover transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 cursor-pointer shadow-subtle hover:shadow-elevated active:translate-y-0"
    >
      {isPending ? "Adding credits..." : "Demo: add 5 credits"}
    </button>
  );
}

export function OfferActionButtons({
  offerId,
  providerSlug,
  status,
  canRefund,
  creditBalance,
}: {
  offerId: string;
  providerSlug: string;
  status: string;
  canRefund: boolean;
  creditBalance: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAccept = () => {
    setErrorMsg(null);
    if (creditBalance < 1) {
      setErrorMsg("Insufficient credits. Top up demo credits to accept leads.");
      return;
    }
    startTransition(async () => {
      const res = await acceptOfferAction(offerId, providerSlug);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    });
  };

  const handleDecline = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await declineOfferAction(offerId, providerSlug);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    });
  };

  const handleFlagInvalid = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await flagInvalidAction(offerId, providerSlug);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        {status === "offered" && (
          <>
            <button
              type="button"
              onClick={handleAccept}
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-teal-primary text-white text-xs font-medium hover:bg-teal-hover transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 cursor-pointer shadow-subtle hover:shadow-elevated active:translate-y-0"
            >
              {isPending ? "Accepting..." : "Accept (1 credit)"}
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={isPending}
              className="px-4 py-2 rounded-xl border border-border bg-surface text-text text-xs font-medium hover:bg-surface-raised transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 cursor-pointer shadow-subtle hover:border-border-strong active:translate-y-0"
            >
              Decline
            </button>
          </>
        )}

        {status === "accepted" && canRefund && (
          <button
            type="button"
            onClick={handleFlagInvalid}
            disabled={isPending}
            className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100/70 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 cursor-pointer shadow-subtle active:translate-y-0"
          >
            {isPending ? "Refunding..." : "Flag as invalid (Refund 1 credit)"}
          </button>
        )}
      </div>

      {errorMsg && (
        <span className="text-[11px] text-red-600 font-medium">{errorMsg}</span>
      )}
    </div>
  );
}

export function SwitchProviderHelper({
  providers,
}: {
  providers: Array<{ slug: string; name: string }>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSelect = (slug: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("role", "provider");
      formData.append("providerSlug", slug);
      await switchDemoRoleAction(formData);
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4 shadow-elevated">
      <h2 className="text-sm font-semibold tracking-tight text-text">
        Select a Provider to View Inbox
      </h2>
      <p className="text-xs text-text-muted leading-relaxed">
        You are currently viewing as Buyer. In Demo mode, select one of the
        service providers below to access their lead offers, credit balance, and
        transaction ledger.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {providers.map((p) => (
          <button
            key={p.slug}
            type="button"
            data-testid={`switch-provider-${p.slug}`}
            onClick={() => handleSelect(p.slug)}
            disabled={isPending}
            className="p-4 text-left rounded-xl border border-border bg-surface-raised hover:bg-surface hover:border-teal-primary/40 text-xs font-medium text-text transition-all duration-200 hover:shadow-subtle hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 group"
          >
            <div className="font-semibold text-text group-hover:text-teal-primary transition-colors">
              {p.name}
            </div>
            <div className="text-[11px] text-teal-primary mt-1.5 font-medium flex items-center gap-1">
              <span>Switch to inbox</span>
              <span className="transition-transform duration-150 group-hover:translate-x-0.5">
                &rarr;
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
