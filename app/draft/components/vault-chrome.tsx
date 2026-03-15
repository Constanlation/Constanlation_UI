"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { ButtonLink, Panel, StatusPill, cn } from "@/app/draft/components/primitives";
import type { VaultRecord } from "@/app/draft/lib/mock-data";

const tabs = (slug: string) => [
  { href: `/vaults/${slug}`, label: "Overview" },
  { href: `/vaults/${slug}/actions`, label: "Actions" },
  { href: `/vaults/${slug}/strategies`, label: "Strategies" },
  { href: `/vaults/${slug}/governance`, label: "Governance" },
  { href: `/vaults/${slug}/guardian`, label: "Safety" },
  { href: `/vaults/${slug}/activity`, label: "Activity" },
  { href: `/vaults/${slug}/queue`, label: "Queue" },
];

export function VaultChrome({
  vault,
  children,
}: {
  vault: VaultRecord;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <Panel className="overflow-hidden p-0">
        <div className="border-b border-white/8 px-6 py-5 md:px-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs tracking-[0.24em] text-[color:var(--gold-soft)] uppercase">
                  {vault.heroTag}
                </span>
                <StatusPill label={vault.health} tone={vault.health} />
                <StatusPill label="Governance approved" tone="gold" />
                <StatusPill
                  label={vault.paused ? "Paused" : "Guardian protected"}
                  tone={vault.paused ? "paused" : "neutral"}
                />
              </div>
              <h1 className="mt-4 font-heading text-3xl text-white md:text-4xl">
                {vault.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-soft)] md:text-base">
                {vault.headline}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[460px]">
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <div className="text-[0.68rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                  Asset / chain
                </div>
                <div className="mt-2 text-base font-semibold text-white">
                  {vault.assetSymbol}
                </div>
                <div className="text-sm text-[color:var(--text-soft)]">{vault.chain}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <div className="text-[0.68rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                  Queue depth
                </div>
                <div className="mt-2 text-base font-semibold text-white">
                  {vault.queueDepth}
                </div>
                <div className="text-sm text-[color:var(--text-soft)]">
                  {vault.queueCoverage}% free-idle coverage
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <div className="text-[0.68rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                  Fast actions
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ButtonLink href={`/vaults/${vault.slug}/actions`} tone="secondary" className="px-3 py-2 text-xs">
                    Deposit
                  </ButtonLink>
                  <ButtonLink href={`/vaults/${vault.slug}/queue`} tone="ghost" className="px-3 py-2 text-xs">
                    Queue
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 px-4 py-4 md:px-5">
          {tabs(vault.slug).map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== `/vaults/${vault.slug}` &&
                pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  active
                    ? "border-[color:var(--line-strong)] bg-[linear-gradient(135deg,rgba(245,221,172,0.12),rgba(192,138,58,0.16))] text-white"
                    : "border-white/8 bg-white/3 text-[color:var(--text-soft)] hover:border-white/16 hover:text-white",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </Panel>

      {children}
    </div>
  );
}
