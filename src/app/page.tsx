import Link from "next/link";

export default function HomePage() {
  return (
    <div className="py-12 max-w-3xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-medium tracking-tight text-text">
          Data-backed planning for GCC setup in India
        </h1>

        <p className="text-base text-text leading-relaxed">
          GCC Atlas provides verified numbers on talent pool sizes, commercial real estate lease rates, and state industrial incentives across major Indian technology hubs.
        </p>

        <p className="text-sm text-text-muted leading-relaxed">
          Every figure is cited from government policies, commercial real estate research, or official filings with as-of dates. If a figure is missing or unverified, it is left unranked rather than imputed.
        </p>

        <div className="pt-4 flex items-center gap-4">
          <Link
            href="/planner"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-sm bg-teal-primary hover:bg-teal-hover text-white text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            Launch Setup Planner
          </Link>
        </div>
      </div>
    </div>
  );
}
