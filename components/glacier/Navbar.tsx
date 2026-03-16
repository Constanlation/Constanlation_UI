"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
            scrolled ? "py-4" : "py-8"
          }`}
        >
          <div className="glacier-container flex items-center justify-between">
            <div className={`g-glass px-6 py-3 flex items-center gap-4 transition-all duration-500 ${scrolled ? "rounded-full" : "rounded-2xl"}`}>
              <div className="w-6 h-6 rounded-full bg-accent shadow-[0_0_15px_rgba(255,246,75,0.5)]" />
              <span className="font-black text-xl tracking-tighter">CONSTANTLATION</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="g-glass px-8 py-3 rounded-full flex items-center gap-8">
                <Link href="/vaults" className="text-xs font-bold tracking-widest uppercase hover:text-accent transition-colors">Vaults</Link>
                <a href="#" className="text-xs font-bold tracking-widest uppercase hover:text-accent transition-colors">Docs</a>
                <a href="#" className="text-xs font-bold tracking-widest uppercase hover:text-accent transition-colors">Governance</a>
              </div>
              <Link href="/vaults" className="g-btn-primary !px-8 !py-3 !text-[11px] !rounded-full">
                Launch App
              </Link>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
