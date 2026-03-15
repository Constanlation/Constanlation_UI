import SiteHeader from "../../components/glacier/SiteHeader";
import HeroSection from "../../components/glacier/HeroSection";
import FeaturesSection from "../../components/glacier/FeaturesSection";
import VaultShowcase from "../../components/glacier/VaultShowcase";
import EcosystemSection from "../../components/glacier/EcosystemSection";
import StarfieldCanvas from "../../components/glacier/StarfieldCanvas";
import "./css/glacier.css";

export default function GlacierLandingPage() {
  return (
    <div className="glacier-root">
      <StarfieldCanvas />

      {/* Ambient glow orbs — very subtle, large, blurred */}
      <div className="glacier-ambient" aria-hidden="true">
        <div className="glacier-orb glacier-orb--gold" />
        <div className="glacier-orb glacier-orb--cyan" />
        <div className="glacier-orb glacier-orb--gold-b" />
      </div>

      <SiteHeader />

      <main>
        <HeroSection />
        <FeaturesSection />
        <VaultShowcase />
        <EcosystemSection />
      </main>

      <footer className="glacier-footer">
        <div className="glacier-footer__inner">
          <div className="glacier-footer__brand">
            <span className="glacier-footer__dot" />
            <span>Constantlation</span>
          </div>
          <nav className="glacier-footer__links">
            <a href="#">Docs</a>
            <a href="#">Governance</a>
            <a href="#">GitHub</a>
            <a href="#">Twitter</a>
          </nav>
          <p className="glacier-footer__copy">
            Curated vault registry · Governed strategies · Cross-chain ready
          </p>
        </div>
      </footer>
    </div>
  );
}
