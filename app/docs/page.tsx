import Link from "next/link";

import { AppPageFrame, KpiStrip, StatusPill } from "@/components/app/AppPrimitives";
import { siteLinks } from "@/lib/site-links";

const guides = [
  {
    title: "Explore Vaults",
    href: siteLinks.vaults,
    description: "Browse indexed vaults, compare APY and risk posture, and drill into queue and guardian data.",
  },
  {
    title: "Register Vault",
    href: siteLinks.vaultRegistration,
    description: "Step through deployment-aligned registration using the current factory defaults and role setup flow.",
  },
  {
    title: "Create Strategy",
    href: siteLinks.strategies,
    description: "Record a strategy address, verify authority context, and prepare it for governance approval.",
  },
  {
    title: "Open Profile",
    href: siteLinks.profile,
    description: "Access role-scoped workspaces for governance, vault admin, keeper, guardian, controller, and depositor actions.",
  },
];

export default function DocsPage() {
  return (
    <AppPageFrame
      title="Product Documentation"
      subtitle="Operational entry points for vault discovery, registration, governance workflows, and depositor activity."
    >
      <KpiStrip
        items={[
          { label: "Primary Flows", value: "4", tone: "accent" },
          { label: "Wallet Access", value: "Required For Writes" },
          { label: "Vault Discovery", value: "Indexed API" },
          { label: "Role Routing", value: "Permission Based" },
        ]}
      />

      <section className="g-glass mt-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill text="Docs Online" tone="good" />
          <StatusPill text="UI Routing Active" tone="good" />
          <StatusPill text="Public Overview" tone="neutral" />
        </div>

        <p className="mt-4 max-w-3xl text-sm text-slate-300">
          Use these routes as the main operating guide through the product. Reads are public, but contract writes require a
          connected wallet with the right role and the expected network selected.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.title}
              href={guide.href}
              className="rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:border-accent/50 hover:bg-white/10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{guide.title}</p>
              <p className="mt-2 text-sm text-slate-300">{guide.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={siteLinks.githubUi}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-white/40 hover:text-white"
          >
            View UI Repository
          </a>
          <a
            href={siteLinks.githubContracts}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-white/40 hover:text-white"
          >
            View Contract Repository
          </a>
        </div>
      </section>
    </AppPageFrame>
  );
}
