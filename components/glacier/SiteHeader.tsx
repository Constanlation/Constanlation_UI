"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 bg-[rgba(3,5,8,0.7)] backdrop-blur-2xl border-b border-white/[0.04]"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="g-section flex items-center justify-between">
        <a href="/" className="relative group">
          <Image
            alt="Constantlation"
            className="h-8 w-auto"
            height={32}
            priority
            src="/ConstantlationLogo.png"
            width={150}
          />
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {["Vaults", "Governance", "Docs"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="px-4 py-2 text-[13px] tracking-[0.04em] text-[var(--fg-muted)] hover:text-white transition-colors duration-300"
            >
              {label}
            </a>
          ))}
        </nav>

        <button className="g-btn-primary text-xs py-2.5 px-5">
          Launch App
        </button>
      </div>
    </header>
  );
}
