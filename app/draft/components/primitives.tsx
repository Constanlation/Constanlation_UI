import Link from "next/link";
import { type ReactNode } from "react";

import type {
    AllocationSegment,
    HealthTone,
    VaultRecord,
} from "@/app/draft/lib/mock-data";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const toneClasses: Record<HealthTone | "gold", string> = {
  healthy:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  review:
    "border-amber-300/20 bg-amber-300/10 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  restricted:
    "border-orange-300/20 bg-orange-300/10 text-orange-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  paused:
    "border-rose-300/20 bg-rose-400/10 text-rose-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  critical:
    "border-red-400/25 bg-red-500/10 text-red-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  neutral:
    "border-white/10 bg-white/6 text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  gold:
    "border-[color:var(--line-strong)] bg-[color:rgba(219,178,103,0.12)] text-[color:var(--champagne)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
};

const barClasses: Record<HealthTone | "gold", string> = {
  healthy: "from-emerald-300/85 to-emerald-500/85",
  review: "from-amber-200/80 to-amber-400/85",
  restricted: "from-orange-200/85 to-orange-500/85",
  paused: "from-rose-200/80 to-rose-500/85",
  critical: "from-red-300/85 to-red-600/85",
  neutral: "from-white/35 to-white/20",
  gold: "from-[#f4d9a1] to-[#c79644]",
};

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-10 w-10 rounded-full border border-[color:var(--line-strong)] bg-[radial-gradient(circle_at_35%_30%,rgba(247,230,193,0.34),rgba(10,8,6,0.55)_60%,rgba(10,8,6,0.92))] shadow-[0_0_24px_rgba(201,150,62,0.18)]",
        className,
      )}
    >
      <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:rgba(255,233,195,0.55)]" />
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--gold)] shadow-[0_0_12px_rgba(228,187,111,0.7)]" />
      <span className="absolute left-2 top-3 h-1.5 w-1.5 rounded-full bg-[color:rgba(255,244,218,0.85)]" />
      <span className="absolute bottom-2.5 right-2 h-1 w-1 rounded-full bg-[color:rgba(255,244,218,0.7)]" />
      <span className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(244,219,165,0.8),transparent)]" />
      <span className="absolute bottom-3 left-1/2 h-3 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(244,219,165,0.8),transparent)]" />
    </div>
  );
}

export function BrandLockup({
  compact = false,
  href = "/",
}: {
  compact?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 text-left text-white transition-opacity hover:opacity-95"
    >
      <BrandMark className={compact ? "h-9 w-9" : "h-10 w-10"} />
      <div className="min-w-0">
        <div
          className={cn(
            "font-heading tracking-[0.16em] text-[color:var(--champagne)] uppercase",
            compact ? "text-[0.64rem]" : "text-[0.72rem]",
          )}
        >
          Constantlation
        </div>
        <div
          className={cn(
            "font-body text-[color:var(--text-soft)]",
            compact ? "text-xs" : "text-sm",
          )}
        >
          Curated vault registry
        </div>
      </div>
    </Link>
  );
}

export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: HealthTone | "gold";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-medium tracking-[0.12em] uppercase",
        toneClasses[tone],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current opacity-90",
          tone === "neutral" && "opacity-60",
        )}
      />
      {label}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  tone = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const styles = {
    primary:
      "border-[color:var(--line-strong)] bg-[linear-gradient(135deg,rgba(245,221,172,1),rgba(192,138,58,1))] text-[#120d06] shadow-[0_18px_40px_rgba(176,122,38,0.22)] hover:translate-y-[-1px]",
    secondary:
      "border-white/10 bg-white/5 text-white hover:border-[color:var(--line-strong)] hover:bg-white/7",
    ghost:
      "border-transparent bg-transparent text-[color:var(--text-soft)] hover:border-white/8 hover:bg-white/4 hover:text-white",
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-medium transition duration-300",
        styles[tone],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(22,18,13,0.94),rgba(12,10,8,0.92))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <div className="mb-3 text-xs font-semibold tracking-[0.24em] text-[color:var(--gold-soft)] uppercase">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="font-heading text-3xl leading-tight text-white md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-soft)] md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: HealthTone | "gold";
}) {
  return (
    <Panel className="h-full p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-medium tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
          {label}
        </div>
        <StatusPill label={tone === "gold" ? "Featured" : tone} tone={tone} />
      </div>
      <div className="mt-5 font-heading text-3xl text-white">{value}</div>
      {detail ? (
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-soft)]">
          {detail}
        </p>
      ) : null}
    </Panel>
  );
}

export function DefinitionRows({
  items,
}: {
  items: Array<{ label: string; value: string; note?: string }>;
}) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
                {item.label}
              </div>
              {item.note ? (
                <div className="mt-1 text-sm text-[color:var(--text-soft)]">
                  {item.note}
                </div>
              ) : null}
            </div>
            <div className="text-right text-sm font-semibold text-white">
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AllocationBar({
  segments,
  className = "",
  compact = false,
}: {
  segments: AllocationSegment[];
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-full border border-white/8 bg-white/4">
        <div className="flex h-3 w-full">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className={cn(
                "h-full bg-gradient-to-r",
                barClasses[segment.tone],
              )}
              style={{ width: `${segment.share}%` }}
              title={`${segment.label}: ${segment.share}%`}
            />
          ))}
        </div>
      </div>
      <div
        className={cn(
          "grid gap-3",
          compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4",
        )}
      >
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full bg-gradient-to-r",
                    barClasses[segment.tone],
                  )}
                />
                <div className="text-sm font-medium text-white">
                  {segment.label}
                </div>
              </div>
              <div className="text-xs tracking-[0.16em] text-[color:var(--text-dim)] uppercase">
                {segment.share}%
              </div>
            </div>
            <div className="mt-2 text-lg font-semibold text-[color:var(--champagne)]">
              {segment.amount}
            </div>
            <div className="mt-1 text-sm leading-6 text-[color:var(--text-soft)]">
              {segment.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConstellationArtwork({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 800 520"
        className="absolute inset-0 h-full w-full opacity-85"
        fill="none"
      >
        <defs>
          <linearGradient id="constellation-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,244,218,0.1)" />
            <stop offset="45%" stopColor="rgba(233,197,122,0.5)" />
            <stop offset="100%" stopColor="rgba(255,244,218,0.08)" />
          </linearGradient>
          <radialGradient id="constellation-node">
            <stop offset="0%" stopColor="rgba(255,244,218,1)" />
            <stop offset="100%" stopColor="rgba(220,173,83,0.18)" />
          </radialGradient>
        </defs>
        <g stroke="url(#constellation-line)" strokeWidth="1.2">
          <path d="M78 328L190 260L330 314L458 210L602 248L718 176" />
          <path d="M145 112L286 168L458 104L608 132L690 88" />
          <path d="M110 418L240 356L382 402L540 332L688 364" />
          <path d="M190 260L286 168L382 402L458 210L540 332L602 248" />
        </g>
        {[
          [78, 328, 6],
          [190, 260, 7],
          [330, 314, 5],
          [458, 210, 7],
          [602, 248, 6],
          [718, 176, 5],
          [145, 112, 4],
          [286, 168, 6],
          [458, 104, 7],
          [608, 132, 5],
          [690, 88, 4],
          [110, 418, 5],
          [240, 356, 5],
          [382, 402, 6],
          [540, 332, 6],
          [688, 364, 5],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="url(#constellation-node)" />
        ))}
      </svg>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(18,15,11,0.96),rgba(9,8,6,0.94))] p-7 shadow-[0_32px_120px_rgba(0,0,0,0.32)] md:p-9">
      <ConstellationArtwork className="opacity-70" />
      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.95fr)]">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="mb-4 text-xs font-semibold tracking-[0.24em] text-[color:var(--gold-soft)] uppercase">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="max-w-3xl font-heading text-4xl leading-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--text-soft)]">
            {description}
          </p>
          {actions ? (
            <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>
        {aside ? <div className="relative">{aside}</div> : null}
      </div>
    </section>
  );
}

export function VaultCard({ vault }: { vault: VaultRecord }) {
  return (
    <Panel className="group relative h-full overflow-hidden p-0 transition duration-300 hover:translate-y-[-2px] hover:border-[color:var(--line-strong)]">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(244,219,165,0.6),transparent)]" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              {vault.chain}
            </div>
            <div className="mt-3 font-heading text-2xl text-white">
              {vault.name}
            </div>
            <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
              {vault.shortDescription}
            </div>
          </div>
          <StatusPill label={vault.health} tone={vault.health} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
            <div className="text-[0.68rem] tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              TVL
            </div>
            <div className="mt-2 text-xl font-semibold text-white">{vault.tvl}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
            <div className="text-[0.68rem] tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              APY
            </div>
            <div className="mt-2 text-xl font-semibold text-white">{vault.apy}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
            <div className="text-[0.68rem] tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              Price Per Share
            </div>
            <div className="mt-2 text-xl font-semibold text-white">
              {vault.pricePerShare}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
            <div className="text-[0.68rem] tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              Queue Depth
            </div>
            <div className="mt-2 text-xl font-semibold text-white">
              {vault.queueDepth}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <StatusPill label="Governance approved" tone="gold" />
          <StatusPill label="Guardian protected" tone="neutral" />
          {vault.paused ? <StatusPill label="Paused" tone="paused" /> : null}
        </div>
        <div className="mt-6 space-y-3">
          {vault.trustPoints.map((point) => (
            <div
              key={point}
              className="flex items-start gap-3 text-sm leading-6 text-[color:var(--text-soft)]"
            >
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
              <span>{point}</span>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href={`/vaults/${vault.slug}`} tone="primary">
            Enter Vault
          </ButtonLink>
          <ButtonLink href={`/vaults/${vault.slug}/queue`} tone="secondary">
            View Queue
          </ButtonLink>
        </div>
      </div>
    </Panel>
  );
}
