"use client";

import { ArrowUpDown, Search } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";

import { AppPageFrame, FilterChip, KpiStrip, StatusPill } from "@/components/app/AppPrimitives";
import { formatUsd } from "@/lib/utils";
import type { VaultListRow } from "@/lib/vaults/types";

type SortKey = "apy" | "tvl" | "risk";

export default function VaultDirectoryPage() {
  const [query, setQuery] = useState("");
  const [chain, setChain] = useState<"All" | "Ethereum" | "Base" | "Polkadot">("All");
  const [sortKey, setSortKey] = useState<SortKey>("tvl");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [rows, setRows] = useState<VaultListRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [provisionalFields, setProvisionalFields] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const loadVaults = async () => {
      try {
        const response = await fetch("/api/vaults", { cache: "no-store" });
        if (!response.ok) {
          setErrorMessage(`Failed to load vault directory (${response.status}).`);
          setRows([]);
          return;
        }

        const payload = (await response.json()) as {
          vaults?: VaultListRow[];
          warnings?: string[];
          provisionalFields?: string[];
          error?: string;
        };

        if (!active) {
          return;
        }

        if (payload.error) {
          setErrorMessage(payload.error);
          setRows([]);
        } else {
          setErrorMessage(null);
          setRows(payload.vaults ?? []);
        }

        setWarnings(payload.warnings ?? []);
        setProvisionalFields(payload.provisionalFields ?? []);
      } catch {
        if (!active) {
          return;
        }
        setErrorMessage("Unable to reach the vault API. Please retry.");
        setRows([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadVaults();

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const tvl = rows.reduce((total, vault) => total + vault.tvl, 0);
    const liquidity = rows.reduce((total, vault) => total + vault.liquidityUsd, 0);
    const avgApy = rows.length ? rows.reduce((total, vault) => total + vault.apy, 0) / rows.length : 0;
    const healthy = rows.filter((vault) => vault.guardianState === "Healthy").length;
    return {
      tvl,
      liquidity,
      avgApy,
      healthy,
      queue: rows.length ? Math.round(rows.reduce((sum, vault) => sum + vault.queueDepthHours, 0) / rows.length) : 0,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows
      .filter((vault) => {
        if (chain !== "All" && vault.chain !== chain) {
          return false;
        }

        const haystack = `${vault.name} ${vault.asset} ${vault.curator}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((a, b) => {
        if (sortKey === "risk") {
          return a.riskScore - b.riskScore;
        }
        return b[sortKey] - a[sortKey];
      });
  }, [chain, query, rows, sortKey]);

  const isFilteredEmpty = !isLoading && rows.length > 0 && filtered.length === 0;
  const isDbEmpty = !isLoading && rows.length === 0;

  return (
    <AppPageFrame
      title="Vault Directory"
      subtitle="Institutional-style discovery: filter by chain, inspect risk posture, and move from evidence to execution in one flow."
    >
      <KpiStrip
        items={[
          { label: "Total TVL", value: formatUsd(metrics.tvl), tone: "accent" },
          { label: "Total Liquidity", value: formatUsd(metrics.liquidity) },
          { label: "Average APY", value: `${metrics.avgApy.toFixed(2)}%` },
          { label: "Healthy Guardian States", value: `${metrics.healthy}/${rows.length}` },
          { label: "Avg Queue Depth", value: `${metrics.queue}h` },
        ]}
      />

      <section className="g-glass mt-4 overflow-hidden p-4 md:p-6">
        <div className="vault-toolbar">
          <label className="vault-search">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by vault, asset, or curator"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
          <Link
            href="/vaults/register"
            className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] g-on-accent transition hover:brightness-105"
          >
            Register Vault
          </Link>
          <div className="flex flex-wrap gap-2">
            {(["All", "Ethereum", "Base", "Polkadot"] as const).map((label) => (
              <FilterChip key={label} label={label} active={chain === label} onClick={() => setChain(label)} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSortKey("tvl")} className={sortButtonClass(sortKey === "tvl")}>
              TVL
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => setSortKey("apy")} className={sortButtonClass(sortKey === "apy")}>
              APY
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => setSortKey("risk")} className={sortButtonClass(sortKey === "risk")}>
              Risk
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
            {errorMessage}
          </div>
        ) : null}

        {warnings.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3 text-xs text-slate-300">
            {warnings.join(" ")}
          </div>
        ) : null}

        {provisionalFields.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-3 text-xs text-sky-100">
            Provisional metrics: {provisionalFields.join(", ")}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3 text-sm text-slate-300">
            Loading vault data from database...
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="vault-table min-w-full">
            <thead>
              <tr>
                <th>Vault</th>
                <th>Chain</th>
                <th>APY</th>
                <th>TVL</th>
                <th>Liquidity</th>
                <th>Exposure</th>
                <th>Risk</th>
                <th>Guardian</th>
                <th aria-label="details" />
              </tr>
            </thead>
            <tbody>
              {isDbEmpty ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-sm text-slate-300">
                    No vaults found in the current database run.
                  </td>
                </tr>
              ) : null}

              {isFilteredEmpty ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-sm text-slate-300">
                    No vaults match your current search and filters.
                  </td>
                </tr>
              ) : null}

              {filtered.map((vault) => {
                const expanded = expandedRow === vault.slug;
                return (
                  <Fragment key={vault.slug}>
                    <tr>
                      <td>
                        <Link href={`/vaults/${vault.slug}`} className="font-semibold text-white transition hover:text-accent">
                          {vault.name}
                        </Link>
                        <p className="mt-1 text-xs text-slate-400">Asset: {vault.asset}</p>
                      </td>
                      <td>{vault.chain}</td>
                      <td className="text-emerald-300">{vault.apy.toFixed(2)}%</td>
                      <td>{formatUsd(vault.tvl)}</td>
                      <td>{formatUsd(vault.liquidityUsd)}</td>
                      <td>
                        <div className="vault-exposure-cell">
                          <span>{vault.exposurePct}%</span>
                          <div className="vault-exposure-track" aria-hidden="true">
                            <span className="vault-exposure-fill" style={{ width: `${vault.exposurePct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>{vault.riskScore}/5</td>
                      <td>
                        <StatusPill
                          text={vault.guardianState}
                          tone={vault.guardianState === "Healthy" ? "good" : "warn"}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-300 hover:border-white/40 hover:text-white"
                          onClick={() => setExpandedRow(expanded ? null : vault.slug)}
                        >
                          {expanded ? "Less" : "More"}
                        </button>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr>
                        <td colSpan={9}>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                            <p>{vault.strategyPreview}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <span>Queue depth: {vault.queueDepthHours}h</span>
                              <span>Liquidity: {formatUsd(vault.liquidityUsd)}</span>
                              <span>Curator: {vault.curator}</span>
                              <Link href={`/vaults/${vault.slug}`} className="text-accent hover:underline">
                                Open vault detail
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppPageFrame>
  );
}

function sortButtonClass(active: boolean) {
  return [
    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
    active
      ? "border-accent bg-accent g-on-accent"
      : "border-white/20 bg-white/5 text-slate-300 hover:border-white/40 hover:text-white",
  ].join(" ");
}
