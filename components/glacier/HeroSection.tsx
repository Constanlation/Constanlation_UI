"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-label", { opacity: 0, y: 20, duration: 0.8, delay: 0.3 })
        .from(".hero-title span", { opacity: 0, y: 40, duration: 1, stagger: 0.12 }, "-=0.4")
        .from(".hero-sub", { opacity: 0, y: 20, duration: 0.8 }, "-=0.5")
        .from(".hero-cta", { opacity: 0, y: 20, duration: 0.7, stagger: 0.1 }, "-=0.4")
        .from(".hero-stat", { opacity: 0, y: 30, duration: 0.7, stagger: 0.08 }, "-=0.3");

      gsap.to(".hero-title", {
        yPercent: -15,
        opacity: 0.3,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center z-10 pt-32 pb-20 px-6"
    >
      <div className="g-grid-overlay" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="hero-label g-label mb-10">
          <span className="w-[6px] h-[6px] rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
          Curated Vault Registry
        </div>

        <h1 className="hero-title text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-8">
          <span className="block text-white">Governed Capital,</span>
          <span className="block g-text-accent">Cross-Chain Ready.</span>
        </h1>

        <p className="hero-sub text-[var(--fg-muted)] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
          Governance-approved strategies, visible guardian controls,
          and transparent withdrawal mechanics — all in one registry.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <button className="hero-cta g-btn-primary">
            Explore Vaults
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="hero-cta g-btn-ghost">
            How it works
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 max-w-3xl mx-auto">
          {[
            { value: "$482M", label: "Total Value Locked" },
            { value: "4 / 4", label: "Strategies Approved" },
            { value: "18.4%", label: "Idle Buffer" },
            { value: "2.8x", label: "Queue Coverage" },
          ].map((stat) => (
            <div key={stat.label} className="hero-stat">
              <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--fg-muted)] mt-2 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
