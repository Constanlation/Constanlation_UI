import Link from "next/link";

import { AppPageFrame, KpiStrip, StatusPill } from "@/components/app/AppPrimitives";
import { siteLinks } from "@/lib/site-links";

const governanceRoles = [
  {
    role: "Governance Admin",
    detail: "Approves strategies, assigns critical roles, and updates treasury and fee policy.",
  },
  {
    role: "Vault Admin",
    detail: "Manages keeper access, idle policy, and vault-level operational controls.",
  },
  {
    role: "Guardian",
    detail: "Pauses riskier flows and executes emergency controls when safety thresholds are breached.",
  },
  {
    role: "Keeper / Controller Admin",
    detail: "Executes automation, harvests, recalls, settlement, and global automation controls.",
  },
];

export default function GovernancePage() {
  return (
    <AppPageFrame
      title="Governance Overview"
      subtitle="A role-separated operating model for strategy approval, vault administration, emergency controls, and automated execution."
    >
      <KpiStrip
        items={[
          { label: "Control Layers", value: "4", tone: "accent" },
          { label: "Role Workspaces", value: "6" },
          { label: "Guardian Controls", value: "Visible" },
          { label: "Automation", value: "Policy Driven" },
        ]}
      />

      <section className="g-glass mt-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill text="Governance Enabled" tone="good" />
          <StatusPill text="Role Separation" tone="good" />
          <StatusPill text="On-Chain Writes" tone="neutral" />
        </div>

        <p className="mt-4 max-w-3xl text-sm text-slate-300">
          Constantlation separates approval, administration, emergency action, and execution so no single operator has
          unnecessary control. The public app exposes these roles as dedicated workspaces once the connected wallet has permission.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {governanceRoles.map((entry) => (
            <div key={entry.role} className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{entry.role}</p>
              <p className="mt-2 text-sm text-slate-300">{entry.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={siteLinks.profile}
            className="rounded-full border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] g-on-accent transition hover:brightness-105"
          >
            Open Role Workspaces
          </Link>
          <Link
            href={siteLinks.vaults}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-white/40 hover:text-white"
          >
            Review Vault Directory
          </Link>
        </div>
      </section>
    </AppPageFrame>
  );
}
