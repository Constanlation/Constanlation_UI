"use client";

import { motion } from "framer-motion";
import { Lock, FileSignature, Route } from "lucide-react";

const signals = [
  {
    icon: Lock,
    title: "Curated registry",
    desc: "Vaults are admitted, not listed. Capital allocators understand what is reviewed and visible at a glance.",
  },
  {
    icon: FileSignature,
    title: "Governed strategies",
    desc: "Operators move with explicit approval. Strategy limits and changes are tied to governance, not market drift.",
  },
  {
    icon: Route,
    title: "Queue transparency",
    desc: "Liquidity friction is explained early. Withdrawal routes and free idle remain visibly accessible.",
  },
];

export default function TrustSignals() {
  return (
    <section className="relative py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
      <div className="absolute inset-0 bg-[var(--gold)]/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="text-center mb-20 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Structured capital,<br />
          <span className="text-[var(--f-muted)]">not open-ended farming.</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="text-[var(--f-muted)] max-w-2xl mx-auto text-lg"
        >
          Morpho-level clarity on the numbers sits inside a stronger process layer. Guardian visibility places trust signals before APY blocks.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative z-10">
        {signals.map((sig, idx) => (
          <motion.div
            key={sig.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glacier-glass rounded-[2rem] p-8 md:p-10 group hover:glacier-glass-strong transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[var(--glacier-cyan)]/10 blur-[40px] rounded-full group-hover:bg-[var(--glacier-cyan)]/20 transition-all duration-700" />
            
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-[var(--gold-soft)] group-hover:text-white transition-colors group-hover:bg-[var(--gold)]/20">
              <sig.icon className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">{sig.title}</h3>
            <p className="text-sm text-[var(--f-muted)] leading-relaxed group-hover:text-white/80 transition-colors">
              {sig.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
