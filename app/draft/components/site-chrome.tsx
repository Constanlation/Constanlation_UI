"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { BrandLockup, ButtonLink, cn } from "@/app/draft/components/primitives";
import { appUser, featuredVault } from "@/app/draft/lib/mock-data";

const mainNav = [
  { href: "/", label: "Home", match: (pathname: string) => pathname === "/" },
  {
    href: "/vaults",
    label: "Vault Registry",
    match: (pathname: string) => pathname.startsWith("/vaults"),
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    match: (pathname: string) => pathname.startsWith("/portfolio"),
  },
];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(214,174,91,0.16),rgba(214,174,91,0.03)_45%,transparent_72%)] blur-2xl" />
        <div className="absolute right-[-8rem] top-[18rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(240,222,183,0.08),rgba(240,222,183,0.02)_48%,transparent_72%)] blur-2xl" />
        <div className="absolute bottom-[-10rem] left-[22%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(112,88,52,0.18),rgba(112,88,52,0.03)_46%,transparent_72%)] blur-2xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/6 bg-[rgba(8,7,6,0.74)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLockup compact />
            <nav className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/4 px-2 py-1 lg:flex">
              {mainNav.map((item) => {
                const active = item.match(pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm transition",
                      active
                        ? "bg-[linear-gradient(135deg,rgba(245,221,172,0.18),rgba(192,138,58,0.2))] text-white"
                        : "text-[color:var(--text-soft)] hover:bg-white/4 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-3 xl:flex">
            <div className="rounded-full border border-[color:var(--line)] bg-white/4 px-4 py-2 text-right">
              <div className="text-[0.65rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                Connected wallet
              </div>
              <div className="text-sm font-medium text-white">{appUser.wallet}</div>
            </div>
            <div className="rounded-full border border-[color:var(--line)] bg-white/4 px-4 py-2">
              <div className="text-[0.65rem] tracking-[0.18em] text-[color:var(--text-dim)] uppercase">
                Demo permissions
              </div>
              <div className="text-sm font-medium text-white">
                LP, Strategist, Gov admin, Guardian
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonLink
              href={`/vaults/${featuredVault.slug}`}
              tone="secondary"
              className="hidden sm:inline-flex"
            >
              Featured Vault
            </ButtonLink>
            <ButtonLink href="/vaults" tone="primary">
              Explore Vaults
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1480px] px-5 pb-18 pt-8 lg:px-8">
        {children}
      </main>

      <footer className="relative z-10 border-t border-white/6 bg-[rgba(8,7,6,0.6)]">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-5 py-8 text-sm text-[color:var(--text-soft)] md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="font-heading text-lg text-white">
              Constantlation
            </div>
            <div>
              Curated vault registry, governed strategies, cross-chain ready.
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {appUser.highlightedPermissions.map((permission) => (
              <span
                key={permission}
                className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-[color:var(--text-dim)]"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
