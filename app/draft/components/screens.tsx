import Link from "next/link";

import { ActionTabs } from "@/app/draft/components/action-tabs";
import {
    AllocationBar,
    ButtonLink,
    DefinitionRows,
    MetricCard,
    PageHeader,
    Panel,
    SectionTitle,
    StatusPill,
    VaultCard,
} from "@/app/draft/components/primitives";
import {
    appUser,
    featuredVault,
    getVault,
    holdings,
    platformStats,
    portfolioActions,
    portfolioEventLog,
    portfolioSummary,
    productPages,
    type VaultRecord,
    vaults,
} from "@/app/draft/lib/mock-data";

function RoleVisibilityCard({
  title,
  allowed,
  allowedCopy,
  deniedCopy,
  actionLabel,
}: {
  title: string;
  allowed: boolean;
  allowedCopy: string;
  deniedCopy: string;
  actionLabel: string;
}) {
  return (
    <Panel className="h-full">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
          {title}
        </div>
        <StatusPill label={allowed ? "Visible" : "Read only"} tone={allowed ? "gold" : "neutral"} />
      </div>
      <div className="mt-4 text-base leading-7 text-white">
        {allowed ? allowedCopy : deniedCopy}
      </div>
      <div className="mt-5 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-[color:var(--text-soft)]">
        {actionLabel}
      </div>
    </Panel>
  );
}

function TimelinePanel({
  title,
  items,
}: {
  title: string;
  items: Array<{ title: string; actor: string; time: string; summary: string; category?: string }>;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Timeline
          </div>
          <h3 className="mt-3 font-heading text-2xl text-white">{title}</h3>
        </div>
        <StatusPill label="Transparent by default" tone="gold" />
      </div>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.title}-${item.time}`}
            className="rounded-[24px] border border-white/8 bg-white/3 px-5 py-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="font-medium text-white">{item.title}</div>
              {item.category ? <StatusPill label={item.category} tone="neutral" /> : null}
            </div>
            <div className="mt-2 text-sm text-[color:var(--text-dim)]">
              {item.actor} • {item.time}
            </div>
            <div className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
              {item.summary}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NotesPanel({ title, notes }: { title: string; notes: string[] }) {
  return (
    <Panel>
      <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
        Plain-language notes
      </div>
      <h3 className="mt-3 font-heading text-2xl text-white">{title}</h3>
      <div className="mt-6 space-y-4">
        {notes.map((note) => (
          <div key={note} className="flex gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
            <span className="text-sm leading-7 text-[color:var(--text-soft)]">{note}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function HomeScreen() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Premium judge-facing landing"
        title="Constantlation is a curated vault registry built for stability, governance, and visible safety."
        description="The homepage leads with one flagship vault, a clear trust story, and a premium black-and-gold fintech aesthetic. It sells the product in five seconds without turning into a noisy DeFi marketplace."
        actions={
          <>
            <ButtonLink href="/vaults" tone="primary">
              Explore Vaults
            </ButtonLink>
            <ButtonLink href={`/vaults/${featuredVault.slug}`} tone="secondary">
              View Featured Vault
            </ButtonLink>
          </>
        }
        aside={
          <Panel className="relative overflow-hidden border-[color:var(--line-strong)] bg-[linear-gradient(180deg,rgba(25,18,10,0.96),rgba(13,10,7,0.94))]">
            <div className="text-xs tracking-[0.22em] text-[color:var(--gold-soft)] uppercase">
              {featuredVault.heroTag}
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-heading text-3xl text-white">{featuredVault.name}</div>
                <div className="mt-2 text-sm text-[color:var(--text-soft)]">
                  {featuredVault.shortDescription}
                </div>
              </div>
              <StatusPill label={featuredVault.health} tone={featuredVault.health} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <div className="text-[0.65rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                  TVL
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">{featuredVault.tvl}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <div className="text-[0.65rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                  APY
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">{featuredVault.apy}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <div className="text-[0.65rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                  Idle / queued
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {featuredVault.idleAssets} / {featuredVault.queuedAssets}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <div className="text-[0.65rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                  Governance posture
                </div>
                <div className="mt-2 text-lg font-semibold text-white">Curated, not open</div>
              </div>
            </div>
            <div className="mt-6">
              <AllocationBar segments={featuredVault.allocation} compact />
            </div>
          </Panel>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {platformStats.map((stat, index) => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
            tone={index === 0 ? "gold" : "neutral"}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Panel className="xl:sticky xl:top-28 xl:h-fit">
          <div className="text-xs tracking-[0.22em] text-[color:var(--gold-soft)] uppercase">
            Guided platform story
          </div>
          <h2 className="mt-4 font-heading text-3xl text-white">
            A premium product first, a protocol surface second.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
            Constantlation should feel cleaner than Morpho, less noisy than Beefy,
            and more guided than Yearn. The landing page keeps technical depth
            available, but never forces users to decode the product on first contact.
          </p>
          <div className="mt-6 space-y-3">
            <StatusPill label="Curated registry" tone="gold" />
            <StatusPill label="Governed strategies" tone="review" />
            <StatusPill label="Guardian safety" tone="healthy" />
            <StatusPill label="Queue transparency" tone="restricted" />
            <StatusPill label="Cross-chain ready" tone="neutral" />
          </div>
        </Panel>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            {
              title: "Curated vault registry",
              body: "Vault discovery feels selective and governed instead of marketplace-like. Health badges, guardrails, and queue obligations surface before APY.",
              tone: "gold" as const,
            },
            {
              title: "Governed strategies",
              body: "Strategies read like approved product modules with destination, yield source, cap, target, automation policy, and role-bound controls.",
              tone: "review" as const,
            },
            {
              title: "Visible safety controls",
              body: "Guardian intervention becomes a product trust feature. Users can always see what changed, what is restricted, and what remains available now.",
              tone: "healthy" as const,
            },
            {
              title: "Signature withdrawal queue",
              body: "Queue depth, snapshot pricing, and settlement mechanics receive a dedicated page so the most novel contract behavior becomes understandable.",
              tone: "restricted" as const,
            },
          ].map((item) => (
            <Panel key={item.title} className="min-h-[220px]">
              <StatusPill label={item.title} tone={item.tone} />
              <div className="mt-5 text-sm leading-7 text-[color:var(--text-soft)]">
                {item.body}
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle
          eyebrow="Flagship vault"
          title="Featured vault storytelling stays product-focused."
          description="The homepage spotlights one flagship vault so judges and first-time users both understand the Constantlation operating model before browsing the wider registry."
        />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill label={featuredVault.health} tone={featuredVault.health} />
              <StatusPill label="Governance approved" tone="gold" />
              <StatusPill label="Guardian protected" tone="neutral" />
            </div>
            <h3 className="mt-4 font-heading text-3xl text-white">
              {featuredVault.name}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
              {featuredVault.healthSummary}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
                <div className="text-[0.68rem] tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
                  Price per share
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {featuredVault.pricePerShare}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
                <div className="text-[0.68rem] tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
                  Free idle
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {featuredVault.freeIdle}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
                <div className="text-[0.68rem] tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
                  Needs rebalance
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {featuredVault.needsRebalance ? "Yes" : "No"}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <AllocationBar segments={featuredVault.allocation} />
            </div>
          </Panel>
          <NotesPanel title="What makes it premium" notes={featuredVault.overviewNotes} />
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle
          eyebrow="Full product map"
          title="The complete 10-page experience is routed and consistent."
          description="Every screen fits the same black, gold, and off-white system while keeping the information hierarchy stable: trust, actions, vault metrics, governance, strategies, then raw technical detail."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {productPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="rounded-[28px] border border-white/8 bg-white/3 p-5 transition hover:border-[color:var(--line-strong)] hover:bg-white/5"
            >
              <div className="text-xs tracking-[0.22em] text-[color:var(--gold-soft)] uppercase">
                Product page
              </div>
              <div className="mt-3 font-heading text-2xl text-white">{page.title}</div>
              <div className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                {page.summary}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function DirectoryScreen() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Vault registry"
        title="Governance-approved vaults presented as a registry, not a marketplace."
        description="The directory leads with health, safety, and governance signals before it ever asks users to compare yields. Each card still exposes the core DeFi metrics, but the product posture stays curated and high-trust."
        actions={
          <>
            <ButtonLink href={`/vaults/${featuredVault.slug}`} tone="primary">
              Enter featured vault
            </ButtonLink>
            <ButtonLink href="/portfolio" tone="secondary">
              View portfolio
            </ButtonLink>
          </>
        }
        aside={
          <Panel>
            <div className="text-xs tracking-[0.22em] text-[color:var(--gold-soft)] uppercase">
              Registry controls
            </div>
            <h2 className="mt-4 font-heading text-3xl text-white">Health-first browsing</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusPill label="All assets" tone="gold" />
              <StatusPill label="Healthy only" tone="healthy" />
              <StatusPill label="Review" tone="review" />
              <StatusPill label="Restricted / paused" tone="restricted" />
            </div>
            <div className="mt-6 text-sm leading-7 text-[color:var(--text-soft)]">
              Premium filters and sorting should emphasize asset, health, and governance posture before APY chasing. The UI keeps the registry legible without feeling sparse.
            </div>
          </Panel>
        }
      />

      <Panel>
        <div className="flex flex-wrap gap-3">
          {[
            "Factory-backed curated registry",
            "Governance-approved only",
            "Guardian visibility",
            "Queue obligations visible",
            "Not an open marketplace",
          ].map((label, index) => (
            <StatusPill
              key={label}
              label={label}
              tone={index === 0 ? "gold" : "neutral"}
            />
          ))}
        </div>
      </Panel>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {vaults.map((vault) => (
          <VaultCard key={vault.slug} vault={vault} />
        ))}
      </section>

      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              Quick compare
            </div>
            <h3 className="mt-3 font-heading text-2xl text-white">
              Registry comparison stays compact and readable.
            </h3>
          </div>
          <StatusPill label="Health before APY" tone="gold" />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-left">
            <thead>
              <tr>
                {[
                  "Vault",
                  "Health",
                  "TVL",
                  "APY",
                  "Idle ratio",
                  "Strategies",
                  "Queue obligations",
                ].map((column) => (
                  <th
                    key={column}
                    className="px-4 pb-2 text-[0.68rem] tracking-[0.22em] text-[color:var(--text-dim)] uppercase"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vaults.map((vault) => (
                <tr key={vault.slug}>
                  <td className="rounded-l-2xl border border-white/8 bg-white/3 px-4 py-4">
                    <Link href={`/vaults/${vault.slug}`} className="font-medium text-white">
                      {vault.name}
                    </Link>
                  </td>
                  <td className="border-y border-white/8 bg-white/3 px-4 py-4">
                    <StatusPill label={vault.health} tone={vault.health} />
                  </td>
                  <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-white">
                    {vault.tvl}
                  </td>
                  <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-white">
                    {vault.apy}
                  </td>
                  <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                    {vault.idleRatio}
                  </td>
                  <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                    {vault.activeStrategies}
                  </td>
                  <td className="rounded-r-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                    {vault.queuedAssets}
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

export function OverviewScreen({ vault }: { vault: VaultRecord }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Vault overview"
        title={`${vault.name} keeps the entire vault state readable at a glance.`}
        description="Premium analytics style, but without drowning the user in raw protocol detail. Trust and action clarity sit above everything else."
        actions={
          <>
            <ButtonLink href={`/vaults/${vault.slug}/actions`} tone="primary">
              Deposit / withdraw
            </ButtonLink>
            <ButtonLink href={`/vaults/${vault.slug}/queue`} tone="secondary">
              View queue
            </ButtonLink>
          </>
        }
        aside={
          <Panel className="space-y-4">
            <div>
              <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
                Health banner
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StatusPill label={vault.health} tone={vault.health} />
                <StatusPill label="Guardian protected" tone="neutral" />
              </div>
            </div>
            <div className="text-sm leading-7 text-[color:var(--text-soft)]">
              {vault.healthSummary}
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
              <div className="text-[0.68rem] tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
                Last automation touch
              </div>
              <div className="mt-2 text-lg font-semibold text-white">{vault.lastHarvest}</div>
            </div>
          </Panel>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="TVL" value={vault.tvl} detail="Total governed capital in the vault." tone="gold" />
        <MetricCard
          label="Price per share"
          value={vault.pricePerShare}
          detail="Live share exchange rate."
          tone="neutral"
        />
        <MetricCard label="APY" value={vault.apy} detail="Derived from historical price-per-share snapshots." tone="healthy" />
        <MetricCard
          label="Idle liquidity"
          value={vault.idleAssets}
          detail={`Free idle ${vault.freeIdle} after queued obligations.`}
          tone={vault.health}
        />
        <MetricCard
          label="Queued assets"
          value={vault.queuedAssets}
          detail="Assets already earmarked for pending queue obligations."
          tone="review"
        />
        <MetricCard
          label="Strategy assets"
          value={vault.strategyAssets}
          detail={`${vault.activeStrategies} active strategies under governance approval.`}
          tone="neutral"
        />
        <MetricCard
          label="Withdrawal fee"
          value={vault.withdrawalFee}
          detail="Shown before every exit action."
          tone="gold"
        />
        <MetricCard
          label="Idle target"
          value={vault.targetIdleAmount}
          detail={`Policy target ${vault.idleTarget} with ${vault.rebalanceSlack} slack.`}
          tone={vault.needsRebalance ? "review" : "healthy"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <SectionTitle
            eyebrow="Live allocation"
            title="Allocation stays readable without hiding the strategy mix."
            description="Idle, deployed strategy sleeves, and queue pressure appear together so users can understand liquidity posture before choosing an action."
          />
          <div className="mt-6">
            <AllocationBar segments={vault.allocation} />
          </div>
        </Panel>
        <NotesPanel title="Liquidity in plain language" notes={vault.overviewNotes} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Governance and guardian summary
          </div>
          <div className="mt-5 grid gap-3">
            {vault.roleAssignments.map((assignment) => (
              <div
                key={assignment.role}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base font-medium text-white">{assignment.role}</div>
                  <div className="text-sm text-[color:var(--champagne)]">
                    {assignment.holders}
                  </div>
                </div>
                <div className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">
                  {assignment.permission}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Fast path actions
          </div>
          <div className="mt-5 grid gap-3">
            {[
              {
                label: "Deposit",
                body: "Deposit assets and receive shares while the vault is not paused.",
                href: `/vaults/${vault.slug}/actions`,
              },
              {
                label: "Withdraw / Redeem",
                body: "See fee, liquidity path, and result preview before signing.",
                href: `/vaults/${vault.slug}/actions`,
              },
              {
                label: "View queue",
                body: "Understand settlement mechanics and single-entry processing.",
                href: `/vaults/${vault.slug}/queue`,
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4 transition hover:border-[color:var(--line-strong)] hover:bg-white/5"
              >
                <div className="text-base font-medium text-white">{item.label}</div>
                <div className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">
                  {item.body}
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

export function ActionsScreen({ vault }: { vault: VaultRecord }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Action page"
        title="Deposit, withdraw, redeem, and request withdraw sit in one guided decision surface."
        description="This page explains how each path works before the user signs. Fees, liquidity state, queue mechanics, and expected outcomes stay visible the whole time."
        aside={
          <Panel>
            <div className="text-xs tracking-[0.22em] text-[color:var(--gold-soft)] uppercase">
              Core distinctions
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--text-soft)]">
              <div>Withdraw uses asset input.</div>
              <div>Redeem uses share input.</div>
              <div>Request withdraw stores a snapshot payout in the queue.</div>
              <div>Deposits stay blocked only when the vault is paused.</div>
            </div>
          </Panel>
        }
      />
      <ActionTabs vault={vault} />
    </div>
  );
}

export function PortfolioScreen() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Portfolio"
        title="The portfolio page explains what you own and what the vault is doing with it."
        description="Holdings, redeemable estimates, queue state, and strategy exposure all appear in one personal dashboard so users understand position quality instead of only seeing balances."
        actions={
          <>
            <ButtonLink href={`/vaults/${featuredVault.slug}/actions`} tone="primary">
              Manage flagship position
            </ButtonLink>
            <ButtonLink href="/vaults" tone="secondary">
              Browse vaults
            </ButtonLink>
          </>
        }
        aside={
          <Panel>
            <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              Connected wallet
            </div>
            <div className="mt-3 text-2xl font-heading text-white">{appUser.wallet}</div>
            <div className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
              Personal dashboard prioritizes clarity on redeemability, queue exposure, and effective strategy mix.
            </div>
          </Panel>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Portfolio value" value={portfolioSummary.totalValue} detail="Current equivalent assets across tracked holdings." tone="gold" />
        <MetricCard label="Unrealized PnL" value={portfolioSummary.unrealizedPnl} detail="Current value less remaining cost basis." tone="healthy" />
        <MetricCard label="Redeemable now" value={portfolioSummary.redeemableNow} detail="Preview-based estimate across holdings." tone="neutral" />
        <MetricCard label="Queued net payout" value={portfolioSummary.queuedNetPayout} detail="Pending queue payout already locked by snapshot pricing." tone="review" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {holdings.map((holding) => {
          const vault = getVault(holding.vaultSlug);
          if (!vault) {
            return null;
          }

          return (
            <Panel key={holding.vaultSlug}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
                    Holding
                  </div>
                  <h2 className="mt-3 font-heading text-2xl text-white">
                    {holding.vaultName}
                  </h2>
                </div>
                <StatusPill label={vault.health} tone={vault.health} />
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <DefinitionRows
                  items={[
                    { label: "Current value", value: holding.value },
                    { label: "Shares", value: holding.shares },
                    { label: "Redeemable estimate", value: holding.redeemable },
                  ]}
                />
                <DefinitionRows
                  items={[
                    { label: "Equivalent assets", value: holding.equivalentAssets },
                    { label: "Max redeem", value: holding.maxRedeem },
                    { label: "Max withdraw", value: holding.maxWithdraw },
                  ]}
                />
              </div>
              <div className="mt-6">
                <AllocationBar segments={holding.exposure} compact />
              </div>
              <div className="mt-5 rounded-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm leading-7 text-[color:var(--text-soft)]">
                {holding.queueStatus}
              </div>
              <div className="mt-4 text-sm font-medium text-[color:var(--champagne)]">
                PnL: {holding.pnl}
              </div>
            </Panel>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Queue and position cues
          </div>
          <div className="mt-5 space-y-3">
            {portfolioActions.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4"
              >
                <div className="text-sm text-[color:var(--text-dim)]">{item.label}</div>
                <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                <div className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">
                  {item.note}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Recent user actions
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr>
                  {["Event", "Timestamp", "Entity", "Tx", "Category"].map((column) => (
                    <th
                      key={column}
                      className="px-4 pb-2 text-[0.68rem] tracking-[0.22em] text-[color:var(--text-dim)] uppercase"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portfolioEventLog.map((event) => (
                  <tr key={`${event.event}-${event.tx}`}>
                    <td className="rounded-l-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm font-medium text-white">
                      {event.event}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {event.timestamp}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {event.entity}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--champagne)]">
                      {event.tx}
                    </td>
                    <td className="rounded-r-2xl border border-white/8 bg-white/3 px-4 py-4">
                      <StatusPill label={event.category} tone="neutral" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </div>
  );
}

export function StrategiesScreen({ vault }: { vault: VaultRecord }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Strategies"
        title="Strategy data is translated into readable product language."
        description="Destinations, yield source, cap, target, automation policy, and role-bound controls are all visible without turning the page into a wall of addresses."
        aside={
          <RoleVisibilityCard
            title="Strategist controls"
            allowed={vault.permissions.strategist}
            allowedCopy="This wallet can allocate, recall, harvest, and prepare rebalance plans for the current vault."
            deniedCopy="You can inspect every strategy, but operator controls stay hidden for non-strategist wallets."
            actionLabel="Role-aware UX keeps transparency public while restricting operator buttons."
          />
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Idle liquidity" value={vault.idleAssets} detail="Visible alongside total strategy assets." tone="gold" />
        <MetricCard label="In strategies" value={vault.strategyAssets} detail={`${vault.activeStrategies} active strategy sleeves.`} tone="neutral" />
        <MetricCard label="Needs rebalance" value={vault.needsRebalance ? "Yes" : "No"} detail={`Target idle ${vault.targetIdleAmount}.`} tone={vault.needsRebalance ? "review" : "healthy"} />
        <MetricCard label="Automation posture" value={vault.guardianState.automationStatus} detail={vault.guardianState.automationNote} tone="neutral" />
      </section>

      <section className="grid gap-6">
        {vault.strategyRecords.map((strategy) => (
          <Panel key={strategy.id}>
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill
                    label={strategy.status}
                    tone={
                      strategy.status === "Panicked"
                        ? "critical"
                        : strategy.status === "Monitoring"
                          ? "review"
                          : "healthy"
                    }
                  />
                  <StatusPill label={strategy.autoManaged ? "Auto-managed" : "Manual"} tone="neutral" />
                </div>
                <h2 className="mt-4 font-heading text-3xl text-white">{strategy.name}</h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
                  {strategy.description}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[460px]">
                <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                  <div className="text-[0.68rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                    Managed assets
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {strategy.managedAssets}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                  <div className="text-[0.68rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                    Target / cap
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {strategy.target} / {strategy.cap}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                  <div className="text-[0.68rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                    Allocation gap
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {strategy.allocationGap}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DefinitionRows
                items={[
                  { label: "Destination", value: strategy.destination },
                  { label: "Yield source", value: strategy.yieldSource },
                ]}
              />
              <DefinitionRows
                items={[
                  { label: "Assets deployed", value: strategy.assetsDeployed },
                  { label: "Target assets", value: strategy.targetAssets },
                ]}
              />
              <DefinitionRows
                items={[
                  { label: "P&L", value: strategy.pnl },
                  { label: "Cooldown", value: strategy.cooldown },
                ]}
              />
              <DefinitionRows
                items={[
                  { label: "Max allocate", value: strategy.maxAllocate },
                  { label: "Max recall", value: strategy.maxRecall },
                ]}
              />
            </div>

            <div className="mt-6 rounded-[24px] border border-white/8 bg-white/3 px-5 py-4 text-sm leading-7 text-[color:var(--text-soft)]">
              <span className="font-medium text-white">Automation policy:</span>{" "}
              {strategy.automationPolicy}. Last harvest {strategy.lastHarvest}; last
              rebalance {strategy.lastRebalance}.
            </div>
          </Panel>
        ))}
      </section>
    </div>
  );
}

export function GovernanceScreen({ vault }: { vault: VaultRecord }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Governance"
        title="Governance is presented as a trust feature, not a hidden admin backend."
        description="Parameters, strategy approvals, role assignments, and event history stay visible to everyone. Privileged controls appear only for the right wallet."
        aside={
          <RoleVisibilityCard
            title="Governance controls"
            allowed={vault.permissions.governance}
            allowedCopy="This wallet can update fee policy, treasury, strategy approvals, and role assignments for the selected vault."
            deniedCopy="This wallet can inspect every config and event, but governance buttons stay hidden."
            actionLabel="Visible to all; management controls only to governance admins."
          />
        }
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <SectionTitle
            eyebrow="Parameters"
            title="Current governed configuration"
            description="Fees, treasury, idle policy, and manager wiring are grouped into clean config cards."
          />
          <div className="mt-6">
            <DefinitionRows items={vault.governanceParameters} />
          </div>
        </Panel>
        <Panel>
          <SectionTitle
            eyebrow="Approved strategies"
            title="Current strategy set"
            description="Readable strategy approval states make the registry feel deliberate and institutional."
          />
          <div className="mt-6">
            <DefinitionRows items={vault.governanceApprovedStrategies} />
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Role assignments
          </div>
          <div className="mt-5 space-y-3">
            {vault.roleAssignments.map((assignment) => (
              <div
                key={assignment.role}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-base font-medium text-white">{assignment.role}</div>
                  <div className="text-sm text-[color:var(--champagne)]">
                    {assignment.holders}
                  </div>
                </div>
                <div className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">
                  {assignment.permission}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <TimelinePanel title="Governance event history" items={vault.governanceEvents} />
      </section>
    </div>
  );
}

export function GuardianScreen({ vault }: { vault: VaultRecord }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Guardian / safety"
        title="Safety is a first-class product page with plain-language user impact."
        description="The page answers whether the vault is safe, what is restricted, what the guardian did, and what a user can do right now. It stays premium and informative without feeling alarmist."
        aside={
          <Panel>
            <div className="text-xs tracking-[0.22em] text-[color:var(--gold-soft)] uppercase">
              Current safety posture
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StatusPill label={vault.guardianState.state} tone={vault.health} />
              <StatusPill label={vault.guardianState.automationStatus} tone="neutral" />
            </div>
            <div className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
              {vault.guardianState.stateNote}
            </div>
          </Panel>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <RoleVisibilityCard
          title="Guardian controls"
          allowed={vault.permissions.guardian}
          allowedCopy="This wallet can pause, unpause, and panic a strategy. The UI keeps those actions visually separated from governance controls."
          deniedCopy="You can inspect the entire safety state, but guardian buttons stay hidden for this wallet."
          actionLabel="Guardian-only actions: pause, unpause, panic strategy."
        />
        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            User impact matrix
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr>
                  {["Action", "Healthy", "Review", "Restricted", "Paused"].map((column) => (
                    <th
                      key={column}
                      className="px-4 pb-2 text-[0.68rem] tracking-[0.22em] text-[color:var(--text-dim)] uppercase"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vault.guardianState.userImpact.map((row) => (
                  <tr key={row.action}>
                    <td className="rounded-l-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm font-medium text-white">
                      {row.action}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {row.healthy}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {row.review}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {row.restricted}
                    </td>
                    <td className="rounded-r-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {row.paused}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <SectionTitle
            eyebrow="Panicked strategies"
            title="Restrictions stay explicit."
            description="If a strategy is panicked, the page explains the residual assets and what that means for users."
          />
          <div className="mt-6">
            {vault.guardianState.panickedStrategies.length > 0 ? (
              <DefinitionRows items={vault.guardianState.panickedStrategies} />
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm leading-7 text-[color:var(--text-soft)]">
                No strategy is panicked in the current vault. Guardian state remains informative even when healthy.
              </div>
            )}
          </div>
        </Panel>
        <TimelinePanel
          title="Guardian event timeline"
          items={vault.guardianState.guardianEvents.map((event) => ({
            title: event.title,
            actor: event.actor,
            time: event.time,
            summary: event.impact,
            category: "Safety",
          }))}
        />
      </section>
    </div>
  );
}

export function ActivityScreen({ vault }: { vault: VaultRecord }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Activity / audit log"
        title="Operational transparency looks like a product surface, not a block explorer clone."
        description="Filters, categories, and linked entities keep the activity log rich and judge-friendly while preserving exactness where it matters."
        aside={
          <Panel>
            <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              Categories
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["User", "Strategist", "Keeper", "Guardian", "Governance", "System"].map((category) => (
                <StatusPill key={category} label={category} tone="neutral" />
              ))}
            </div>
          </Panel>
        }
      />

      <Panel>
        <div className="flex flex-wrap gap-2">
          {["All events", "User actions", "Governance", "Safety", "Automation", "Queue"].map((filter, index) => (
            <StatusPill key={filter} label={filter} tone={index === 0 ? "gold" : "neutral"} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <TimelinePanel
          title="Recent operational highlights"
          items={vault.activityEvents.map((event) => ({
            title: event.event,
            actor: event.actor,
            time: event.timestamp,
            summary: `${event.entity} • ${event.tx}`,
            category: event.category,
          }))}
        />
        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Detailed event table
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr>
                  {["Event", "Actor", "Timestamp", "Entity", "Tx", "Category"].map((column) => (
                    <th
                      key={column}
                      className="px-4 pb-2 text-[0.68rem] tracking-[0.22em] text-[color:var(--text-dim)] uppercase"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vault.activityEvents.map((event) => (
                  <tr key={`${event.event}-${event.tx}`}>
                    <td className="rounded-l-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm font-medium text-white">
                      {event.event}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {event.actor}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {event.timestamp}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {event.entity}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--champagne)]">
                      {event.tx}
                    </td>
                    <td className="rounded-r-2xl border border-white/8 bg-white/3 px-4 py-4">
                      <StatusPill label={event.category} tone="neutral" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function QueueScreen({ vault }: { vault: VaultRecord }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Withdrawal queue"
        title="The queue becomes one of Constantlation’s most memorable and explanatory pages."
        description="Queue depth, idle coverage, processing options, snapshot pricing, and residual handling are all visible together so the mechanism feels transparent instead of opaque."
        aside={
          <Panel>
            <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
              Queue overview
            </div>
            <div className="mt-4 text-4xl font-heading text-white">{vault.queueDepth}</div>
            <div className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">
              Current queued obligations with {vault.queueCoverage}% free-idle coverage.
            </div>
            <div className="mt-5 rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
              <div className="text-[0.68rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                Idle vs queue
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#f5dca8,#c58e39)]"
                  style={{ width: `${vault.queueCoverage}%` }}
                />
              </div>
              <div className="mt-3 text-sm text-[color:var(--text-soft)]">
                Free idle {vault.freeIdle}; total idle {vault.idleAssets}; queue obligations {vault.queuedAssets}.
              </div>
            </div>
          </Panel>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Idle assets" value={vault.idleAssets} detail="Total reserve currently sitting inside the vault." tone="gold" />
        <MetricCard label="Free idle" value={vault.freeIdle} detail="Idle not already earmarked for queued obligations." tone={vault.queueCoverage < 50 ? "review" : "healthy"} />
        <MetricCard label="Queued assets" value={vault.queuedAssets} detail="Snapshot-based obligations already recorded." tone="review" />
        <MetricCard label="Settlement posture" value={vault.queueCoverage < 50 ? "Staged" : "Ready"} detail="Queue pages explain what is processable now." tone={vault.queueCoverage < 50 ? "restricted" : "healthy"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Queue mechanics explained
          </div>
          <div className="mt-5 space-y-3">
            {vault.queueExplainers.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4"
              >
                <div className="text-base font-medium text-white">{item.label}</div>
                <div className="mt-2 text-sm font-medium text-[color:var(--champagne)]">
                  {item.value}
                </div>
                <div className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">
                  {item.note}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Queue entries
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr>
                  {["ID", "Owner", "Shares", "Net payout", "Fee", "Status", "ETA"].map((column) => (
                    <th
                      key={column}
                      className="px-4 pb-2 text-[0.68rem] tracking-[0.22em] text-[color:var(--text-dim)] uppercase"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vault.queueEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="rounded-l-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm font-medium text-white">
                      {entry.id}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {entry.owner}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {entry.shares}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-white">
                      {entry.netPayout}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {entry.fee}
                    </td>
                    <td className="border-y border-white/8 bg-white/3 px-4 py-4">
                      <StatusPill
                        label={entry.status}
                        tone={entry.status === "Ready to process" ? "healthy" : "review"}
                      />
                    </td>
                    <td className="rounded-r-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm text-[color:var(--text-soft)]">
                      {entry.settlementEta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Settlement section
          </div>
          <div className="mt-5 rounded-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm leading-7 text-[color:var(--text-soft)]">
            Batch settlement stays permissionless and clearly separated from single-entry processing. Anyone can help move the queue forward, but funds always route to the original receiver.
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={`/vaults/${vault.slug}/activity`} tone="primary">
              Review settlement events
            </ButtonLink>
            <ButtonLink href={`/vaults/${vault.slug}/actions`} tone="secondary">
              Create new request
            </ButtonLink>
          </div>
        </Panel>

        <Panel>
          <div className="text-xs tracking-[0.2em] text-[color:var(--text-dim)] uppercase">
            Single-entry processing
          </div>
          <div className="mt-5 rounded-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm leading-7 text-[color:var(--text-soft)]">
            Ready entries can be processed individually. The UI explains when a request is ready, when it is waiting on idle, and why snapshot payout means the user already knows the amount they are owed.
          </div>
        </Panel>
      </section>
    </div>
  );
}
