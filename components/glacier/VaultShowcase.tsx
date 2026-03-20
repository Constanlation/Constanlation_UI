"use client";

import { motion } from "framer-motion";
import GlassCard from "./GlassCard";

const strategyMetrics = [
  { label: "Strategy Authorization", value: "Verified", detail: "3/5 Signed", type: "Security" },
  { label: "Liquidity Buffer", value: "Active", detail: "18.4% Available", type: "Liquidity" },
  { label: "Guardian Monitoring", value: "Online", detail: "12s Cadence", type: "Monitoring" },
  { label: "Withdrawal Queue", value: "Healthy", detail: "2.8x Coverage", type: "Redemption" },
];

export default function VaultShowcase() {
  return (
    <section className="glacier-section py-32 relative overflow-hidden">
      <div className="glacier-container">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="g-label mb-8">Operational Visibility</span>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-[0.95]">
                Structured for <br />
                <span className="g-text-accent text-glow">Accountable Performance</span>
              </h2>
              <p className="text-slate-400 text-xl leading-relaxed mb-12">
                Replace opaque yield hunting with controlled capital deployment.
                Track strategy execution, liquidity posture, and safety signals in one audit-ready view.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {strategyMetrics.map((m, idx) => (
                  <GlassCard key={idx} className="p-8 group hover:border-accent/40" strong>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">{m.type}</span>
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-1 group-hover:text-accent transition-colors">{m.label}</h4>
                    <p className="text-2xl font-black text-white mb-2">{m.value}</p>
                    <div className="bg-white/5 h-[1px] w-full my-4" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{m.detail}</p>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 w-full">
            {/* Visual Dashboard Representation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="relative aspect-square max-w-[600px] mx-auto"
            >
              {/* Central Shield Graphic */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full border border-white/5 rounded-full animate-spin-slow opacity-50" />
                <div className="absolute inset-20 border border-white/5 rounded-full animate-spin-reverse opacity-30" />
                <div className="absolute inset-0 bg-accent/5 blur-[120px] rounded-full" />
                
                <GlassCard className="w-48 h-48 rounded-full flex items-center justify-center p-0 border-white/20" strong>
                   <div className="text-center">
                     <p className="text-xs font-bold text-accent uppercase tracking-[0.2em] mb-1">Status</p>
                     <p className="text-2xl font-black text-white">SECURE</p>
                   </div>
                </GlassCard>
              </div>

              {/* Data points orbs */}
              {[0, 90, 180, 270].map((angle, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ 
                    duration: 20 + i * 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: `rotate(${angle}deg) translateY(-250px)` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-accent shadow-[0_0_15px_var(--accent)]" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
