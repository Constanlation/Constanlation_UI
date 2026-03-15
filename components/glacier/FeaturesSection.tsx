"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { num: "01", title: "Curated Registry", desc: "Vaults are admitted, not listed." },
  { num: "02", title: "Governed Strategies", desc: "Operators move with explicit approval." },
  { num: "03", title: "Guardian Controls", desc: "Intervention rights stay visible." },
  { num: "04", title: "Queue Transparency", desc: "Exit friction is explained early." },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0, y: 50, duration: 0.8, delay: i * 0.1,
          scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 py-32 lg:py-40">
      <div className="g-section">
        <div className="text-center mb-20">
          <p className="g-label g-label--alt mx-auto mb-6">
            <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent)]" />
            Why Constantlation
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Structured capital,<br />
            <span className="text-[var(--fg-muted)]">not open-ended farming.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.num} className="feature-card g-glass p-7 group cursor-default">
              <span className="text-[var(--fg-dim)] text-xs font-mono tracking-wider">{f.num}</span>
              <h3 className="text-lg font-semibold text-white mt-4 mb-3 group-hover:text-[var(--accent-soft)] transition-colors duration-300">{f.title}</h3>
              <p className="text-[var(--fg-muted)] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
