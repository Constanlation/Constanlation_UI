"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import OrbitImages from "../OrbitImages";

const partners = [
  { src: "/ecosystemAndOther/polkadot-new-dot-logo.svg", alt: "Polkadot" },
  { src: "/ecosystemAndOther/web3foundation.png", alt: "Web3 Foundation" },
  { src: "/ecosystemAndOther/OZ-Logo-WhiteBG.svg", alt: "OpenZeppelin" },
  { src: "/ecosystemAndOther/OpenGuild White - Transparency.png", alt: "OpenGuild" },
];

export default function PartnersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={sectionRef} className="glacier-section py-20 md:py-24 lg:py-28 relative overflow-hidden">
      <div className="glacier-container flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0.45, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="partners-header mb-20 max-w-2xl"
        >
          <span className="g-label mb-6">Ecosystem Backbone</span>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">
            Built for the <span className="g-text-accent">Multichain</span> Future
          </h2>
          <p className="text-slate-400 text-lg">
            Constantlation leverages industry-leading protocols to ensure 
            grade-A security and cross-chain interoperability.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0.4, scale: 0.985 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="orbit-container relative w-full max-w-[800px] aspect-square flex items-center justify-center p-8"
        >
          <OrbitImages
            images={partners.map(p => p.src)}
            baseWidth={800}
            radiusX={300}
            radiusY={250}
            itemSize={70}
            duration={40}
            showPath={true}
            pathColor="rgba(255, 246, 75, 0.12)"
            pathWidth={1}
            responsive={true}
            centerContent={
              <div className="relative z-10 w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
                <img 
                  src="/ConstantlationLogo.png" 
                  alt="Constantlation Logo" 
                  className="w-32 h-auto relative z-10 filter drop-shadow-[0_0_30px_rgba(255,246,75,0.4)]"
                />
              </div>
            }
          />
        </motion.div>
      </div>
    </section>
  );
}
