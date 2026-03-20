"use client";

import Grainient from "@/components/Grainient";
import EcosystemSection from "@/components/glacier/EcosystemSection";
import FeaturesSection from "@/components/glacier/FeaturesSection";
import HeroSection from "@/components/glacier/HeroSection";
import PartnersSection from "@/components/glacier/PartnersSection";
import StarfieldCanvas from "@/components/glacier/StarfieldCanvas";
import VaultShowcase from "@/components/glacier/VaultShowcase";
import { UnifiedNavbar } from "@/components/navigation/UnifiedNavbar";

export default function HomePage() {
  return (
    <div className="glacier-root">
      <StarfieldCanvas />

      <div className="fixed inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay z-[1]">
        <Grainient
          grainAmount={0.2}
          grainScale={1.5}
          timeSpeed={0.03}
          color1="#030508"
          color2="#0a0a0a"
          color3="#030508"
        />
      </div>

      <div className="glacier-ambient" aria-hidden="true">
        <div className="glacier-orb glacier-orb--gold" />
        <div className="glacier-orb glacier-orb--cyan" />
      </div>

      <UnifiedNavbar variant="landing" />

      <main className="relative z-10 w-full overflow-x-clip">
        <HeroSection />
        <PartnersSection />
        <FeaturesSection />
        <VaultShowcase />
        <EcosystemSection />
      </main>

      <footer className="glacier-footer relative z-20">
        <div className="glacier-footer__inner">
          <div className="glacier-footer__brand group cursor-pointer">
            <span className="glacier-footer__dot glacier-footer__dot--interactive" />
            <span className="font-black tracking-tighter text-2xl">CONSTANTLATION</span>
          </div>
          <nav className="glacier-footer__links">
            <a href="#">Docs</a>
            <a href="#">Governance</a>
            <a href="#">GitHub</a>
            <a href="#">X (Twitter)</a>
          </nav>
          <div className="flex flex-col items-center gap-4">
            <p className="glacier-footer__copy">
              © 2026 Constantlation Vault · Space-Grade Engineering
            </p>
            <div className="flex gap-4 opacity-30">
              <span className="w-1 h-1 rounded-full bg-white" />
              <span className="w-1 h-1 rounded-full bg-white" />
              <span className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
