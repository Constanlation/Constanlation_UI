"use client";

import { motion } from "framer-motion";
import LogoLoop from "../LogoLoop";
import GlassCard from "./GlassCard";

const partners = [
  { src: "/ecosystemAndOther/polkadot-new-dot-logo.svg", alt: "Polkadot" },
  { src: "/ecosystemAndOther/web3foundation.png", alt: "Web3 Foundation" },
  { src: "/ecosystemAndOther/OZ-Logo-WhiteBG.svg", alt: "OpenZeppelin" },
  { src: "/ecosystemAndOther/OpenGuild White - Transparency.png", alt: "OpenGuild" },
  { src: "/ecosystemAndOther/66d28647bbcfd6d72e61c0f5_Hydration.png", alt: "Hydration" },
  { src: "/ecosystemAndOther/hyperbridge.png", alt: "Hyperbridge" },
];

export default function EcosystemSection() {
  return (
    <section className="glacier-section py-32 relative overflow-hidden">
      <div className="glacier-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="ecosystem-header text-center mb-24"
        >
          <span className="g-label mb-6">Ecosystem Connectivity</span>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-white">
            Integrated Across <span className="g-text-accent">Polkadot Primitives</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Constantlation connects treasury-grade vault operations to the leading
            Dotsama protocols, enabling coordinated liquidity and resilient yield paths.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <GlassCard className="p-16 overflow-hidden flex items-center justify-center h-48" strong>
            <LogoLoop
              logos={partners}
              speed={80}
              gap={100}
              logoHeight={40}
              pauseOnHover={true}
              scaleOnHover={true}
              fadeOut={true}
              fadeOutColor="#030508"
            />
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
