"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center z-10 pt-32 pb-20 px-6 overflow-hidden"
    >
      <div className="g-grid-overlay" />

      <motion.div 
        style={{ y: y1, opacity, scale }}
        className="relative z-10 max-w-5xl mx-auto"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-label g-label mb-12 mx-auto"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_15px_var(--accent)]" />
          Constantlation Vault • Glacier Release
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-6xl md:text-8xl lg:text-[7.5rem] font-black mb-10 tracking-tight leading-[0.85] text-white"
        >
          Space-Grade <br />
          <span className="g-text-accent">Yield Registry</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-[var(--fg-muted)] text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-16"
        >
          A curated, high-performance vault registry for the Polkadot ecosystem. 
          Grade-A security meets sophisticated multi-chain yield strategies.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32"
        >
          <button className="g-btn-primary group">
            Explore Vaults
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
          <button className="g-btn-ghost">
            Read Docs
          </button>
        </motion.div>

        <motion.div 
          style={{ y: y2 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12 max-w-4xl mx-auto"
        >
          {[
            { value: "$482M", label: "Total Locked" },
            { value: "4 / 4", label: "Strat Approved" },
            { value: "18.4%", label: "Idle Buffer" },
            { value: "2.8x", label: "Queue Coverage" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--fg-muted)] font-bold opacity-60">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Hero ambient glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.03, 0.05, 0.03]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-accent blur-[180px] rounded-full pointer-events-none" 
      />
    </section>
  );
}
