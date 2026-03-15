"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const partners = [
  "Polkadot", "Moonbeam", "Astar", "Hydration",
  "Acala", "Phala", "Interlay", "Zeitgeist",
];

export default function EcosystemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".eco-heading", {
        opacity: 0, y: 30, duration: 0.8,
        scrollTrigger: { trigger: ".eco-heading", start: "top 85%" },
      });
      gsap.from(".eco-partner", {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.06,
        scrollTrigger: { trigger: ".eco-grid", start: "top 85%" },
      });
      gsap.from(".eco-watermark", {
        opacity: 0, duration: 1.5,
        scrollTrigger: { trigger: ".eco-watermark", start: "top 90%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 py-32 lg:py-40">
      <div className="g-section text-center">
        <p className="eco-heading g-label g-label--alt mx-auto mb-6">
          <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent)]" />
          Ecosystem
        </p>
        <h2 className="eco-heading text-3xl md:text-5xl font-bold text-white mb-4">
          Cross-Chain Ready
        </h2>
        <p className="eco-heading text-[var(--fg-muted)] text-lg max-w-xl mx-auto mb-16">
          Built for the Polkadot ecosystem and beyond.
        </p>

        <div className="eco-grid grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-20">
          {partners.map((name) => (
            <div
              key={name}
              className="eco-partner g-glass flex items-center justify-center py-5 px-4 text-sm font-medium text-[var(--fg-muted)] hover:text-white hover:border-[var(--glass-border-hover)] transition-all duration-300 cursor-default"
            >
              {name}
            </div>
          ))}
        </div>

        <div className="eco-watermark relative overflow-hidden py-8">
          <p
            className="text-[clamp(4rem,12vw,10rem)] font-extrabold tracking-tighter whitespace-nowrap text-transparent select-none"
            style={{ WebkitTextStroke: "1px rgba(255, 246, 75, 0.04)" }}
          >
            CONSTANTLATION
          </p>
        </div>
      </div>
    </section>
  );
}
