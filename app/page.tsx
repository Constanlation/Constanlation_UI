"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect } from "react";

type NavItem = {
  href: string;
  label: string;
};

type StatItem = {
  detail: string;
  label: string;
  value: string;
};

type AllocationItem = {
  label: string;
  share: string;
  width: string;
};

type StoryItem = {
  copy: string;
  eyebrow: string;
  title: string;
};

type RouteItem = {
  copy: string;
  label: string;
  route: string;
  status: string;
};

const navItems: NavItem[] = [
  { href: "#registry", label: "Registry" },
  { href: "#featured-vault", label: "Featured Vault" },
  { href: "#governance", label: "Governance" },
  { href: "#product-map", label: "Product Map" },
  { href: "#contact", label: "Contact" },
];

const heroStats: StatItem[] = [
  {
    value: "$482M",
    label: "Flagship TVL",
    detail: "Polaris Prime holds the showcase liquidity posture.",
  },
  {
    value: "4 / 4",
    label: "Strategies approved",
    detail: "Every active strategy sits behind governance review.",
  },
  {
    value: "18.4%",
    label: "Idle buffer",
    detail: "Capital stays ready for exits before yield is chased.",
  },
  {
    value: "2.8x",
    label: "Queue coverage",
    detail: "Withdrawal demand is visible before liquidity gets tight.",
  },
];

const trustSignals: StoryItem[] = [
  {
    eyebrow: "Curated registry",
    title: "Vaults are admitted, not listed.",
    copy:
      "Constantlation keeps the registry selective so capital allocators understand what is reviewed, active, and visible at a glance.",
  },
  {
    eyebrow: "Governed strategies",
    title: "Operators move with explicit approval.",
    copy:
      "Strategy adds, limits, and changes remain tied to governance posture rather than opaque marketplace drift.",
  },
  {
    eyebrow: "Guardian controls",
    title: "Intervention rights stay visible.",
    copy:
      "Guardian posture is surfaced as a product feature, so safety controls are legible before users ever sign a transaction.",
  },
  {
    eyebrow: "Queue transparency",
    title: "Liquidity friction is explained early.",
    copy:
      "Users see queue obligations, free idle, and request pathways in plain language instead of discovering them at withdrawal time.",
  },
];

const featuredMetrics: StatItem[] = [
  { value: "8.6%", label: "Net APY", detail: "Stabilized target yield, not teaser APY." },
  { value: "$1.084", label: "Price per share", detail: "Yield accrual remains transparent." },
  { value: "6h", label: "Last review", detail: "Recent governance oversight is visible." },
  { value: "4 min", label: "Guardian latency", detail: "Operational intervention remains fast." },
  { value: "4", label: "Strategies", detail: "Diversified, governed capital deployment." },
  { value: "Healthy", label: "Health status", detail: "No queue stress or pause conditions active." },
];

const allocationItems: AllocationItem[] = [
  { label: "Treasuries + credit", share: "38%", width: "38%" },
  { label: "RWA carry sleeve", share: "24%", width: "24%" },
  { label: "Cross-chain liquidity", share: "20%", width: "20%" },
  { label: "Protected idle", share: "18%", width: "18%" },
];

const governanceSignals: StatItem[] = [
  {
    value: "Approved",
    label: "Governance state",
    detail: "Current strategy mix is actively governed and reviewed.",
  },
  {
    value: "Protected",
    label: "Guardian posture",
    detail: "Escalation and pause authority remain visible to LPs.",
  },
  {
    value: "Open",
    label: "Queue route",
    detail: "Withdraw, redeem, and request-withdraw paths are disclosed up front.",
  },
];

const storyCards: StoryItem[] = [
  {
    eyebrow: "Governance rail",
    title: "Structured capital, not open-ended farming.",
    copy:
      "Morpho-level clarity on the numbers sits inside a stronger process layer: strategy adds, limits, and operator rights are part of the product story.",
  },
  {
    eyebrow: "Guardian visibility",
    title: "Safety controls stay on the surface.",
    copy:
      "The page communicates pause authority, review cadence, and intervention readiness so institutional trust signals arrive before the APY block.",
  },
  {
    eyebrow: "Cross-chain future",
    title: "Built for a broader on-chain constellation.",
    copy:
      "The landing page frames Constantlation as Polkadot-ready infrastructure that can grow into cross-chain vault routing without abandoning legibility.",
  },
];

const routeCards: RouteItem[] = [
  {
    label: "Vault Directory",
    route: "/vaults",
    status: "Health-first list",
    copy: "Browse curated vaults through safety signals, idle posture, and governance status before yield comparisons.",
  },
  {
    label: "Vault Overview",
    route: "/vaults/[slug]",
    status: "Core intelligence",
    copy: "Give every vault a structured control room for TVL, queue exposure, allocation, and guardian posture.",
  },
  {
    label: "Actions",
    route: "/vaults/[slug]/actions",
    status: "Decision support",
    copy: "Make deposit, withdraw, redeem, and request-withdraw flows legible before signatures happen.",
  },
  {
    label: "Strategies",
    route: "/vaults/[slug]/strategies",
    status: "Operator detail",
    copy: "Explain what is live, approved, disabled, or rate-limited without hiding behind protocol jargon.",
  },
  {
    label: "Governance + Guardian",
    route: "/vaults/[slug]/governance",
    status: "Visible oversight",
    copy: "Show policy, permissions, pauses, and approvals as a user-facing trust layer.",
  },
  {
    label: "Queue + Activity",
    route: "/vaults/[slug]/queue",
    status: "Exit transparency",
    copy: "Surface queue obligations, pending exits, and operational history as part of the normal liquidity journey.",
  },
];

function useLandingMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const parallaxSections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax-section]"),
    );
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let observer: IntersectionObserver | null = null;

    const markVisible = () => {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
    };

    const update = () => {
      frame = 0;

      const viewportHeight = window.innerHeight || 1;
      const scrollLimit = Math.max(
        document.documentElement.scrollHeight - viewportHeight,
        1,
      );

      root.style.setProperty("--page-scroll", (window.scrollY / scrollLimit).toFixed(4));

      parallaxSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const rawProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        const progress = Math.min(Math.max(rawProgress, 0), 1);
        section.style.setProperty("--section-progress", progress.toFixed(4));
      });
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    };

    const setupObserver = () => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            }
          });
        },
        {
          threshold: 0.18,
          rootMargin: "0px 0px -8% 0px",
        },
      );

      revealTargets.forEach((target) => observer?.observe(target));
    };

    const syncMotionPreference = () => {
      root.dataset.motion = motionQuery.matches ? "reduced" : "full";

      if (motionQuery.matches) {
        markVisible();
        observer?.disconnect();
        observer = null;
      } else if (!observer) {
        setupObserver();
      }

      requestUpdate();
    };

    syncMotionPreference();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    motionQuery.addEventListener("change", syncMotionPreference);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      observer?.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      motionQuery.removeEventListener("change", syncMotionPreference);
    };
  }, []);
}

function SectionHeading({
  copy,
  eyebrow,
  title,
}: {
  copy: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="space-y-5">
      <div
        className="reveal inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/5 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[color:var(--text-soft)]"
        data-reveal
      >
        <span className="h-2 w-2 rounded-full bg-[color:var(--gold)] shadow-[0_0_20px_rgba(217,177,98,0.55)]" />
        {eyebrow}
      </div>
      <h2
        className="reveal font-heading text-3xl leading-tight text-[color:var(--foreground)] sm:text-4xl lg:text-[3.15rem]"
        data-reveal
      >
        {title}
      </h2>
      <p
        className="reveal max-w-2xl text-base leading-8 text-[color:var(--text-soft)] sm:text-lg"
        data-reveal
      >
        {copy}
      </p>
    </div>
  );
}

export default function Home() {
  useLandingMotion();

  return (
    <main className="landing-page">
      <div aria-hidden="true" className="ambient-field">
        <div className="ambient-orb ambient-orb--north" />
        <div className="ambient-orb ambient-orb--east" />
        <div className="ambient-orb ambient-orb--south" />
        <div className="ambient-grid" />
      </div>

      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-[1180px]">
          <div className="nav-shell">
            <a className="flex items-center gap-3" href="#hero">
              <Image
                alt="Constantlation logo"
                className="h-10 w-auto"
                height={40}
                priority
                src="/ConstantlationLogo.png"
                width={187}
              />
            </a>
            <nav aria-label="Primary" className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => (
                <a key={item.href} className="nav-pill" href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
            <a className="button-primary hidden sm:inline-flex" href="#featured-vault">
              Explore Polaris Prime
            </a>
          </div>
        </div>
      </header>

      <section
        className="scroll-mt-28 px-4 pb-20 pt-8 sm:pb-24 sm:pt-12"
        data-parallax-section
        id="hero"
      >
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="space-y-8">
            <div
              className="reveal inline-flex items-center gap-3 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--text-soft)] shadow-[var(--shadow-soft)]"
              data-reveal
            >
              <span className="h-2 w-2 rounded-full bg-[color:var(--gold)] shadow-[0_0_18px_rgba(221,177,101,0.65)]" />
              Curated vault registry for governed capital
            </div>

            <div className="space-y-5">
              <p
                className="reveal text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--text-dim)]"
                data-reveal
              >
                Governed strategies. Guardian visibility. Queue transparency.
              </p>
              <h1
                className="reveal max-w-4xl font-heading text-5xl leading-[0.98] text-[color:var(--foreground)] sm:text-6xl lg:text-7xl"
                data-reveal
              >
                Curated vaults for stable capital, with glacier-grade calm and
                cross-chain posture.
              </h1>
              <p
                className="reveal max-w-2xl text-lg leading-8 text-[color:var(--text-soft)] sm:text-xl"
                data-reveal
              >
                Constantlation is a curated vault registry with governance-approved
                strategies, visible guardian controls, and transparent withdrawal
                mechanics. The experience stays cinematic, but the trust layer stays
                first.
              </p>
            </div>

            <div className="reveal flex flex-wrap gap-4" data-reveal>
              <a className="button-primary" href="#featured-vault">
                View the flagship vault
              </a>
              <a className="button-secondary" href="#product-map">
                See the product surface
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((stat, index) => (
                <article
                  key={stat.label}
                  className="glass-panel reveal p-5"
                  data-reveal
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <p className="text-2xl font-semibold text-[color:var(--foreground)]">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--gold-soft)]">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                    {stat.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative min-h-[30rem]">
            <div className="hero-stage">
              <div
                aria-hidden="true"
                className="absolute inset-x-[12%] top-[12%] h-56 rounded-full bg-[radial-gradient(circle,_rgba(252,243,218,0.22),_transparent_72%)] blur-3xl"
              />

              <div
                className="parallax-layer absolute left-0 top-8 hidden max-w-[13rem] lg:block"
                style={{ "--depth": "1.4" } as CSSProperties}
              >
                <div className="glass-panel reveal p-5" data-reveal>
                  <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--text-dim)]">
                    Governance state
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
                    Approved
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">
                    Strategy adds and limits stay in explicit review loops.
                  </p>
                </div>
              </div>

              <div
                className="parallax-layer absolute right-0 top-16 hidden max-w-[14rem] lg:block"
                style={{ "--depth": "1.8" } as CSSProperties}
              >
                <div className="glass-panel reveal p-5" data-reveal>
                  <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--text-dim)]">
                    Queue posture
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
                    2.8x
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">
                    Free idle and request-withdraw routes remain visible before exits.
                  </p>
                </div>
              </div>

              <div
                className="parallax-layer absolute bottom-0 left-[6%] hidden max-w-[14rem] lg:block"
                style={{ "--depth": "1.2" } as CSSProperties}
              >
                <div className="glass-panel reveal p-5" data-reveal>
                  <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--text-dim)]">
                    Guardian response
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
                    4 min
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">
                    Protective controls are positioned as a first-class product signal.
                  </p>
                </div>
              </div>

              <div
                className="parallax-layer relative mx-auto flex h-full max-w-[34rem] items-center"
                style={{ "--depth": "0.85" } as CSSProperties}
              >
                <article className="glass-panel reveal w-full p-6 sm:p-8" data-reveal>
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="space-y-4">
                      <div className="inline-flex rounded-full border border-[color:var(--line-strong)] bg-[rgba(244,229,193,0.08)] px-4 py-2 text-xs uppercase tracking-[0.26em] text-[color:var(--gold-soft)]">
                        Featured vault
                      </div>
                      <div>
                        <h2 className="font-heading text-3xl text-[color:var(--foreground)] sm:text-4xl">
                          Polaris Prime
                        </h2>
                        <p className="mt-3 max-w-md text-sm leading-7 text-[color:var(--text-soft)]">
                          Flagship governed vault for capital that values controlled
                          deployment, visible intervention rights, and a transparent
                          exit path.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">
                      Healthy
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {[
                      ["TVL", "$482M"],
                      ["Net APY", "8.6%"],
                      ["Strategies", "4 active"],
                      ["Free idle", "18.4%"],
                    ].map(([label, value]) => (
                      <div className="metric-block" key={label}>
                        <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-dim)]">
                          {label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-[color:var(--text-dim)]">
                      <span>Strategy composition</span>
                      <span>Governed exposure</span>
                    </div>
                    {allocationItems.map((item) => (
                      <div className="space-y-2" key={item.label}>
                        <div className="flex items-center justify-between gap-4 text-sm text-[color:var(--text-soft)]">
                          <span>{item.label}</span>
                          <span className="text-[color:var(--champagne)]">{item.share}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/6">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,var(--gold),var(--champagne))]"
                            style={{ width: item.width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-28 px-4 py-20 sm:py-28"
        data-parallax-section
        id="registry"
      >
        <div className="mx-auto max-w-[1180px] space-y-12">
          <SectionHeading
            copy="The landing experience leads with safety, control, and health. Yield exists, but it is framed as a result of discipline rather than a teaser number."
            eyebrow="Registry posture"
            title="Premium, glassy surfaces around a stricter trust narrative."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {trustSignals.map((item, index) => (
              <article
                key={item.title}
                className="glass-panel reveal min-h-[18rem] p-6"
                data-reveal
                style={{ transitionDelay: `${index * 85}ms` }}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--gold-soft)]">
                  {item.eyebrow}
                </p>
                <h3 className="mt-5 font-heading text-2xl text-[color:var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-28 px-4 py-20 sm:py-28"
        data-parallax-section
        id="featured-vault"
      >
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-28">
            <SectionHeading
              copy="Polaris Prime is presented like a flagship capital product: clear metrics, visible queue posture, guarded operator flows, and elegant glass framing instead of dashboard clutter."
              eyebrow="Flagship spotlight"
              title="Morpho-style data discipline inside a glacier-inspired vault board."
            />

            <div className="glass-panel reveal p-6" data-reveal>
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-dim)]">
                What the spotlight should communicate
              </p>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-[color:var(--text-soft)]">
                <li>Governance-approved status is visible before users care about yield.</li>
                <li>Withdrawal queue mechanics are part of the product story, not hidden complexity.</li>
                <li>Guardian protection reads like operational maturity rather than emergency copy.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <article className="glass-panel reveal p-6 sm:p-8" data-reveal>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-dim)]">
                    Featured vault metrics
                  </p>
                  <h3 className="mt-3 font-heading text-3xl text-[color:var(--foreground)]">
                    Polaris Prime control room
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line-strong)] bg-[rgba(249,232,189,0.08)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--gold-soft)]">
                  Governance approved
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredMetrics.map((metric, index) => (
                  <div
                    className="metric-block reveal"
                    data-reveal
                    key={metric.label}
                    style={{ transitionDelay: `${index * 70}ms` }}
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-dim)]">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
                      {metric.value}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                      {metric.detail}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-6 xl:grid-cols-2">
              <article className="glass-panel reveal p-6 sm:p-8" data-reveal>
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-dim)]">
                  Deployment mix
                </p>
                <h3 className="mt-3 font-heading text-2xl text-[color:var(--foreground)]">
                  Strategy exposure stays legible.
                </h3>
                <div className="mt-8 space-y-5">
                  {allocationItems.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between gap-4 text-sm text-[color:var(--text-soft)]">
                        <span>{item.label}</span>
                        <span className="text-[color:var(--champagne)]">{item.share}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,var(--gold),var(--champagne))]"
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="glass-panel reveal p-6 sm:p-8" data-reveal>
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-dim)]">
                  Safety signals
                </p>
                <h3 className="mt-3 font-heading text-2xl text-[color:var(--foreground)]">
                  Guardian and queue posture remain visible.
                </h3>
                <div className="mt-8 space-y-5">
                  {governanceSignals.map((signal) => (
                    <div className="metric-block" key={signal.label}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-dim)]">
                          {signal.label}
                        </p>
                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-soft)]">
                          {signal.value}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                        {signal.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-28 px-4 py-20 sm:py-28"
        data-parallax-section
        id="governance"
      >
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-28">
            <SectionHeading
              copy="This section should feel paced and editorial, with deeper parallax and stronger contrast between the calm shell and the underlying operational depth."
              eyebrow="Narrative depth"
              title="Taiko-like pacing for the story Constantlation actually needs to tell."
            />

            <div className="glass-panel reveal p-6" data-reveal>
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-dim)]">
                Section rhythm
              </p>
              <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
                Each block reveals a different trust layer: process, safety, and future
                interoperability. The parallax should feel deliberate rather than playful.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {storyCards.map((story, index) => (
              <article
                key={story.title}
                className="glass-panel reveal p-6 sm:p-8"
                data-reveal
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--line-strong)] bg-[rgba(245,229,193,0.08)] text-lg font-semibold text-[color:var(--champagne)]">
                    0{index + 1}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--gold-soft)]">
                      {story.eyebrow}
                    </p>
                    <h3 className="mt-4 font-heading text-2xl text-[color:var(--foreground)] sm:text-3xl">
                      {story.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-sm leading-8 text-[color:var(--text-soft)] sm:text-base">
                      {story.copy}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-28 px-4 py-20 sm:py-28"
        data-parallax-section
        id="product-map"
      >
        <div className="mx-auto max-w-[1180px] space-y-12">
          <SectionHeading
            copy="The homepage ends by mapping the full product surface. These are capability cards, not live-route promises, so the landing page still feels complete even before the rest of the app is rebuilt."
            eyebrow="Product surface"
            title="A premium route map for the rest of the Constantlation system."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {routeCards.map((card, index) => (
              <article
                key={card.route}
                className="glass-panel reveal min-h-[18rem] p-6"
                data-reveal
                style={{ transitionDelay: `${index * 65}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-dim)]">
                      {card.status}
                    </p>
                    <h3 className="mt-4 font-heading text-2xl text-[color:var(--foreground)]">
                      {card.label}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[color:var(--line)] bg-white/5 px-3 py-2 text-[0.72rem] uppercase tracking-[0.18em] text-[color:var(--gold-soft)]">
                    {card.route}
                  </span>
                </div>
                <p className="mt-5 text-sm leading-7 text-[color:var(--text-soft)]">
                  {card.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-28 px-4 pb-10 pt-20 sm:pb-12 sm:pt-28"
        data-parallax-section
        id="contact"
      >
        <div className="mx-auto max-w-[1180px]">
          <article className="glass-panel reveal relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12" data-reveal>
            <div
              aria-hidden="true"
              className="absolute right-[-8%] top-[-30%] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(246,231,196,0.22),_transparent_72%)] blur-3xl"
            />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold-soft)]">
                  Closing signal
                </p>
                <h2 className="font-heading text-3xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
                  Calm, premium, and clearly governed from the first scroll.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-[color:var(--text-soft)] sm:text-lg">
                  The landing page should leave judges with one message: Constantlation
                  is designed for disciplined vault products, not a generic DeFi
                  marketplace. The interface reflects that restraint.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 lg:justify-end">
                <a className="button-primary" href="#hero">
                  Back to top
                </a>
                <a className="button-secondary" href="#featured-vault">
                  Revisit Polaris Prime
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <footer className="px-4 pb-12">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 border-t border-[color:var(--line)] pt-6 text-sm text-[color:var(--text-dim)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              alt="Constantlation logo"
              className="h-8 w-auto opacity-80"
              height={32}
              src="/ConstantlationLogo.png"
              width={150}
            />
            <span>Curated vault registry, governed strategies, cross-chain ready.</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-4">
            {navItems.map((item) => (
              <a key={item.href} className="transition-colors hover:text-[color:var(--foreground)]" href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}
