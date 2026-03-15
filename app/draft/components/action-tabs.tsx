"use client";

import { useState } from "react";

import { ButtonLink, DefinitionRows, Panel, StatusPill, cn } from "@/app/draft/components/primitives";
import type { VaultRecord } from "@/app/draft/lib/mock-data";

type TabKey = "deposit" | "withdraw" | "redeem" | "requestWithdraw";

const tabOrder: Array<{
  key: TabKey;
  label: string;
  tone: "gold" | "review" | "healthy" | "restricted";
}> = [
  { key: "deposit", label: "Deposit", tone: "gold" as const },
  { key: "withdraw", label: "Withdraw", tone: "review" as const },
  { key: "redeem", label: "Redeem", tone: "healthy" as const },
  {
    key: "requestWithdraw",
    label: "Request Withdraw",
    tone: "restricted" as const,
  },
];

const comparisonRows = [
  {
    flow: "Withdraw",
    input: "Asset amount",
    execution: "Immediate",
    liquidity: "Auto-recalls from strategies if needed",
    pricing: "Live price per share",
    fee: "Deducted immediately",
  },
  {
    flow: "Redeem",
    input: "Share amount",
    execution: "Immediate",
    liquidity: "Auto-recalls from strategies if needed",
    pricing: "Live price per share",
    fee: "Deducted immediately",
  },
  {
    flow: "Request Withdraw",
    input: "Share amount",
    execution: "Queued unless idle already covers the request",
    liquidity: "Waits for idle replenishment or permissionless processing",
    pricing: "Snapshot payout fixed at request time",
    fee: "Locked at request time and paid on settlement",
  },
];

export function ActionTabs({ vault }: { vault: VaultRecord }) {
  const [active, setActive] = useState<TabKey>("deposit");
  const current = vault.actionFlows[active];

  return (
    <div className="space-y-6">
      <Panel className="p-4">
        <div className="grid gap-2 md:grid-cols-4">
          {tabOrder.map((tab) => {
            const selected = tab.key === active;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={cn(
                  "rounded-[22px] border px-4 py-4 text-left transition",
                  selected
                    ? "border-[color:var(--line-strong)] bg-[linear-gradient(135deg,rgba(245,221,172,0.12),rgba(192,138,58,0.1))]"
                    : "border-white/8 bg-white/3 hover:border-white/14 hover:bg-white/5",
                )}
              >
                <StatusPill label={tab.label} tone={tab.tone} />
                <div className="mt-4 text-sm leading-6 text-[color:var(--text-soft)]">
                  {vault.actionFlows[tab.key].summary}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <StatusPill
                label={tabOrder.find((tab) => tab.key === active)?.label ?? "Action"}
                tone={tabOrder.find((tab) => tab.key === active)?.tone ?? "gold"}
              />
              <h2 className="mt-4 font-heading text-3xl text-white">{current.title}</h2>
            </div>
            <ButtonLink href={`/vaults/${vault.slug}/queue`} tone="ghost" className="px-4 py-2 text-xs">
              View queue state
            </ButtonLink>
          </div>

          <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
            {current.summary}
          </p>
          <p className="mt-3 rounded-2xl border border-[color:var(--line)] bg-[rgba(214,174,91,0.08)] px-4 py-3 text-sm leading-7 text-[color:var(--champagne)]">
            {current.helper}
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 text-xs tracking-[0.22em] text-[color:var(--text-dim)] uppercase">
                Inputs and limits
              </div>
              <DefinitionRows items={current.fields} />
            </div>
            <div>
              <div className="mb-3 text-xs tracking-[0.22em] text-[color:var(--text-dim)] uppercase">
                Result preview
              </div>
              <DefinitionRows items={current.preview} />
            </div>
          </div>
        </Panel>

        <Panel className="space-y-4">
          <div>
            <div className="text-xs tracking-[0.22em] text-[color:var(--text-dim)] uppercase">
              Signing note
            </div>
            <div className="mt-3 text-sm leading-7 text-white">{current.notice}</div>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/3 p-4">
            <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              Liquidity state
            </div>
            <div className="mt-3 text-2xl font-heading text-white">{vault.freeIdle}</div>
            <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
              Free idle available now against {vault.queuedAssets} in queued obligations.
            </div>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/3 p-4">
            <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              Exit fee
            </div>
            <div className="mt-3 text-2xl font-heading text-white">
              {vault.withdrawalFee}
            </div>
            <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
              Shown before signing on every withdraw, redeem, and queue request.
            </div>
          </div>
          <button
            type="button"
            className="w-full rounded-full border border-[color:var(--line-strong)] bg-[linear-gradient(135deg,rgba(245,221,172,1),rgba(192,138,58,1))] px-5 py-3 text-sm font-semibold text-[#120d06] transition hover:translate-y-[-1px]"
          >
            {current.buttonLabel}
          </button>
          <div className="text-xs leading-6 text-[color:var(--text-dim)]">
            Demo-only UI. Connect the real contract actions to this panel when wallet flows are wired.
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.22em] text-[color:var(--text-dim)] uppercase">
              Action comparison
            </div>
            <h3 className="mt-3 font-heading text-2xl text-white">
              Withdraw vs redeem vs request withdraw
            </h3>
          </div>
          <StatusPill label="Clarity first" tone="gold" />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-left">
            <thead>
              <tr>
                {["Flow", "Input", "Execution", "Liquidity", "Pricing", "Fee"].map((column) => (
                  <th
                    key={column}
                    className="px-4 pb-2 text-[0.68rem] font-semibold tracking-[0.22em] text-[color:var(--text-dim)] uppercase"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.flow}>
                  <td className="rounded-l-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm font-semibold text-white">
                    {row.flow}
                  </td>
                  <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                    {row.input}
                  </td>
                  <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                    {row.execution}
                  </td>
                  <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                    {row.liquidity}
                  </td>
                  <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                    {row.pricing}
                  </td>
                  <td className="rounded-r-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                    {row.fee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
