"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const allocations = [
  { label: "Treasuries + credit", pct: 38 },
  { label: "RWA carry sleeve", pct: 24 },
  { label: "Cross-chain liquidity", pct: 20 },
  { label: "Protected idle", pct: 18 },
];

const signals = [
  { label: "Governance", value: "Approved", color: "#4ade80" },
  { label: "Guardian", value: "Protected", color: "var(--accent-soft)" },
  { label: "Queue", value: "Open", color: "var(--accent)" },
];

export default function VaultShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".vault-hero-card", {
        opacity: 0, y: 60, duration: 1,
        scrollTrigger: { trigger: ".vault-hero-card", start: "top 85%" },
      });
      gsap.utils.toArray<HTMLElement>(".vault-side").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0, x: i % 2 === 0 ? -40 : 40, duration: 0.8,
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
      gsap.utils.toArray<HTMLElement>(".alloc-bar-fill").forEach((bar) => {
        gsap.from(bar, {
          width: 0, duration: 1.2, ease: "power2.out",
          scrollTrigger: { trigger: bar, start: "top 90%" },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 py-32 lg:py-40">
      <div className="g-section">
        <div className="text-center mb-16">
          <p className="g-label mx-auto mb-6">
            <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent-glow)]" />
            Flagship Vault
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white">Polaris Prime</h2>
          <p className="text-[var(--fg-muted)] mt-3 text-lg">Flagship governed vault for capital that values controlled deployment.</p>
        </div>

        <div className="vault-hero-card g-glass-strong p-8 md:p-12 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Healthy
              </span>
            </div>
            <span className="text-[var(--fg-dim)] text-xs tracking-wider uppercase">Governance Approved</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: "$482M", label: "TVL" },
              { value: "8.6%", label: "Net APY" },
              { value: "$1.084", label: "Share Price" },
              { value: "4 min", label: "Guardian Latency" },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">{m.value}</p>
                <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--fg-muted)] mt-2">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="vault-side g-glass p-7 md:p-9">
            <h3 className="text-base font-semibold text-white mb-6 tracking-wide">Strategy Exposure</h3>
            <div className="space-y-5">
              {allocations.map((a) => (
                <div key={a.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--fg-muted)]">{a.label}</span>
                    <span className="text-[var(--accent-soft)] font-medium tabular-nums">{a.pct}%</span>
                  </div>
                  <div className="h-[6px] bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="alloc-bar-fill h-full rounded-full"
                      style={{
                        width: `${a.pct}%`,
                        background: `linear-gradient(90deg, var(--accent-deep), var(--accent))`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="vault-side g-glass p-7 md:p-9">
            <h3 className="text-base font-semibold text-white mb-6 tracking-wide">Safety Signals</h3>
            <div className="space-y-5">
              {signals.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                  <span className="text-[var(--fg-muted)] text-sm">{s.label}</span>
                  <span className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
