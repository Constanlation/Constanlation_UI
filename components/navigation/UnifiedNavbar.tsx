"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

type NavbarVariant = "landing" | "app";

type UnifiedNavbarProps = {
  variant: NavbarVariant;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function NavItem({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cx(
        "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition",
        active ? "bg-accent g-on-accent" : "text-slate-200 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}

export function UnifiedNavbar({ variant }: UnifiedNavbarProps) {
  const pathname = usePathname();
  const isLanding = variant === "landing";
  const [fromPortfolio, setFromPortfolio] = useState(false);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTimeout(() => setFromPortfolio(params.get("from") === "portfolio"), 0);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    const hideThreshold = isLanding ? 150 : 110;

    if (latest > previous && latest > hideThreshold) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    setScrolled(latest > (isLanding ? 50 : 20));
  });

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cx(
            "fixed left-0 right-0 top-0 z-[120] transition-all duration-300",
            isLanding ? (scrolled ? "py-4" : "py-8") : scrolled ? "py-3" : "py-5"
          )}
        >
          <div className={cx(isLanding ? "glacier-container" : "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8", "flex items-center justify-between gap-3")}>
            <Link
              href="/"
              className={cx(
                "g-glass flex items-center gap-4 px-6 py-3 transition-all duration-500",
                isLanding ? (scrolled ? "rounded-full" : "rounded-2xl") : "rounded-full"
              )}
            >
              <span className="h-6 w-6 rounded-full bg-accent shadow-[0_0_15px_rgba(255,246,75,0.5)]" />
              <span className="text-xl font-black tracking-tighter">CONSTANTLATION</span>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              <div
                className={cx(
                  "g-glass flex items-center rounded-full",
                  isLanding ? "gap-8 px-8 py-3" : "gap-4 px-4 py-2"
                )}
              >
                <NavItem href="/" active={!isLanding && pathname === "/"}>
                  Home
                </NavItem>
                <NavItem href="/vaults" active={pathname?.endsWith("/vaults") ?? false}>
                  Vaults
                </NavItem>
                {isLanding ? (
                  <>
                    <a className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-accent" href="#">
                      Docs
                    </a>
                    <a className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-accent" href="#">
                      Governance
                    </a>
                  </>
                ) : (
                  <>
                    <NavItem href="/vaults/register" active={pathname?.startsWith("/vaults/register") ?? false}>
                      Register
                    </NavItem>
                    <NavItem href="/strategies/create" active={pathname?.startsWith("/strategies") ?? false}>
                      Strategies
                    </NavItem>
                    <NavItem href="/profile" active={(pathname?.startsWith("/profile") ?? false) && !fromPortfolio}>
                      Profile
                    </NavItem>
                    <NavItem
                      href="/portfolio"
                      active={(pathname?.startsWith("/portfolio") ?? false) || ((pathname?.startsWith("/profile") ?? false) && fromPortfolio)}
                    >
                      Portfolio
                    </NavItem>
                  </>
                )}
              </div>

              {isLanding ? (
                <Link href="/vaults" className="g-btn-primary !rounded-full !px-8 !py-3 !text-[11px]">
                  Launch App
                </Link>
              ) : (
                <ConnectWalletButton variant="compact" />
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/vaults"
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-white/40 hover:text-white"
              >
                Vaults
              </Link>
              {!isLanding ? (
                <Link
                  href="/strategies/create"
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-white/40 hover:text-white"
                >
                  Strategies
                </Link>
              ) : null}
              {!isLanding ? (
                <Link
                  href="/profile"
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-white/40 hover:text-white"
                >
                  Profile
                </Link>
              ) : null}
              {!isLanding ? <ConnectWalletButton variant="compact" /> : null}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
