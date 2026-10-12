"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { submitIntroRequestAction, type SubmitIntroResult } from "@/app/actions/leads";
import { InteractiveButton } from "@/components/InteractiveButton";
import type { ProviderCategory } from "@/modules/providers";

interface IntroFormProps {
  cities: Array<{ slug: string; name: string }>;
  categories: Array<{ id: ProviderCategory; label: string }>;
  providers: Array<{ slug: string; name: string; category: string }>;
  preselectedProvider?: string;
}

export function IntroForm({
  cities,
  categories,
  providers,
  preselectedProvider,
}: IntroFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitIntroResult | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await submitIntroRequestAction(formData);
      setResult(res);
      if (res.success) {
        form.reset();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Notice per ADR 006 */}
      <div
        role="note"
        className="p-4 rounded-2xl border border-accent/20 bg-accent-subtle text-xs text-accent flex items-center justify-between shadow-subtle"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-medium">Prototype: nothing is sent to anyone.</span>
        </div>
        <span className="text-[11px] text-text-muted">Simulated matching engine</span>
      </div>

      {result?.success ? (
        <div className="rounded-2xl border border-border bg-surface p-8 space-y-5 shadow-elevated">
          <div className="flex items-center gap-2.5 text-teal-primary font-semibold text-base">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <span>Request Received</span>
          </div>

          {result.data.status === "matched" ? (
            <p
              data-testid="lead-routed-confirmation"
              className="text-sm text-text leading-relaxed"
            >
              Your intro request was created and routed to{" "}
              <strong>{result.data.offersCreated}</strong> matched service{" "}
              {result.data.offersCreated === 1 ? "provider" : "providers"}. To
              simulate the provider experience, switch to one of the matched
              providers in the <strong>Demo mode</strong> header switcher and
              visit the{" "}
              <Link
                href="/inbox"
                className="text-teal-primary underline font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
              >
                Provider Inbox
              </Link>
              .
            </p>
          ) : (
            <p className="text-sm text-text leading-relaxed">
              Your request was recorded (ID: <code>{result.data.leadId.slice(0, 8)}</code>),
              but no providers currently match this exact category and city.
              Zero providers have been offered this lead.
            </p>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="inline-flex items-center gap-1.5 text-xs text-teal-primary hover:text-teal-hover hover:underline font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Submit another intro request</span>
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-elevated"
        >
          {result && !result.success && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {result.error}
            </div>
          )}

          {/* Section: Buyer Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-text border-b border-border/80 pb-2">
              Buyer Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="buyerName"
                  className="block text-xs font-medium text-text"
                >
                  Your Name *
                </label>
                <input
                  id="buyerName"
                  name="buyerName"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="buyerCompany"
                  className="block text-xs font-medium text-text"
                >
                  Company Name *
                </label>
                <input
                  id="buyerCompany"
                  name="buyerCompany"
                  type="text"
                  required
                  placeholder="e.g. Global Tech Corp"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="buyerEmail"
                className="block text-xs font-medium text-text"
              >
                Work Email *
              </label>
              <input
                id="buyerEmail"
                name="buyerEmail"
                type="email"
                required
                placeholder="name@company.com"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary transition-all"
              />
              <p className="text-[11px] text-text-muted">
                Your email will remain hidden from providers until they spend 1 credit to accept your request.
              </p>
            </div>
          </div>

          {/* Section: GCC Parameters */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-text border-b border-border/80 pb-2">
              GCC Parameters
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="citySlug"
                  className="block text-xs font-medium text-text"
                >
                  Target City *
                </label>
                <select
                  id="citySlug"
                  name="citySlug"
                  required
                  defaultValue={cities[0]?.slug}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary cursor-pointer transition-all"
                >
                  {cities.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="headcount"
                  className="block text-xs font-medium text-text"
                >
                  Planned Headcount *
                </label>
                <input
                  id="headcount"
                  name="headcount"
                  type="number"
                  min="1"
                  required
                  defaultValue="100"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="function"
                  className="block text-xs font-medium text-text"
                >
                  Primary Function *
                </label>
                <select
                  id="function"
                  name="function"
                  required
                  defaultValue="software_engineering"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary cursor-pointer transition-all"
                >
                  <option value="software_engineering">Software Engineering</option>
                  <option value="digital_ai">Digital & AI</option>
                  <option value="product_design">Product & Design</option>
                  <option value="corporate_finance_hr">Corporate (Finance / HR / Legal)</option>
                  <option value="it_infrastructure">IT & Infrastructure</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="category"
                  className="block text-xs font-medium text-text"
                >
                  Service Category Needed *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  defaultValue={categories[0]?.id}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary cursor-pointer transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="timeline"
                  className="block text-xs font-medium text-text"
                >
                  Implementation Timeline *
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  required
                  defaultValue="3_months"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary cursor-pointer transition-all"
                >
                  <option value="immediate">Immediate (&lt; 1 month)</option>
                  <option value="3_months">1–3 months</option>
                  <option value="6_months">3–6 months</option>
                  <option value="exploring">Exploring / Feasibility</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="chosenProviderSlug"
                className="block text-xs font-medium text-text"
              >
                Specific Provider (Optional)
              </label>
              <select
                id="chosenProviderSlug"
                name="chosenProviderSlug"
                defaultValue={preselectedProvider || ""}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary cursor-pointer transition-all"
              >
                <option value="">Auto-match up to 3 fair rotation providers</option>
                {providers.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-text-muted">
                If omitted, GCC Atlas rotates leads fairly across eligible providers (max 3).
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="note"
                className="block text-xs font-medium text-text"
              >
                Additional Notes
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                placeholder="Mention any specific facility requirements, specializations, or questions..."
                className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <InteractiveButton
              type="submit"
              disabled={isPending}
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              {isPending ? "Submitting request..." : "Submit Intro Request"}
            </InteractiveButton>
          </div>
        </form>
      )}
    </div>
  );
}
