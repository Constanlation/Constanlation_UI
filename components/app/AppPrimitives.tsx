"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

import { UnifiedNavbar } from "@/components/navigation/UnifiedNavbar";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AppPageFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="glacier-root min-h-screen pb-16">
      <div className="glacier-ambient" aria-hidden="true">
        <div className="glacier-orb glacier-orb--gold" />
        <div className="glacier-orb glacier-orb--cyan" />
      </div>
      <UnifiedNavbar variant="app" />
      <main className="relative z-20 mx-auto w-full max-w-[1280px] px-4 pt-28 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="g-glass-strong vault-hero-header"
        >
          <p className="g-label">Curated Vault Registry</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">{subtitle}</p>
        </motion.header>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

export function AppTopNav() {
  return <UnifiedNavbar variant="app" />;
}

export function KpiStrip({
  items,
}: {
  items: Array<{ label: string; value: string; tone?: "neutral" | "accent" }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="g-glass vault-kpi-card">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
          <p className={cx("mt-2 text-xl font-extrabold tracking-tight", item.tone === "accent" ? "text-accent" : "text-white")}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function StatusPill({ text, tone = "neutral" }: { text: string; tone?: "neutral" | "good" | "warn" }) {
  return (
    <span
      className={cx(
        "inline-flex max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
        tone === "good" && "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        tone === "warn" && "border-amber-400/30 bg-amber-400/10 text-amber-200",
        tone === "neutral" && "border-white/20 bg-white/5 text-slate-300"
      )}
    >
      {text}
    </span>
  );
}

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition",
        active
          ? "border-accent bg-accent g-on-accent"
          : "border-white/20 bg-white/5 text-slate-300 hover:border-white/40 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}

const vaultSections = [
  { id: "overview", label: "Overview" },
  { id: "actions", label: "Actions" },
  { id: "strategies", label: "Strategies" },
  { id: "governance", label: "Governance" },
  { id: "guardian", label: "Guardian" },
  { id: "activity", label: "Activity" },
  { id: "queue", label: "Queue" },
];

export function VaultLocalSubnav() {
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const scrollToSection = (sectionId: string, behavior: ScrollBehavior) => {
      const target = document.getElementById(sectionId);
      if (!target) {
        return;
      }

      // Offset for fixed app navbar and page breathing room.
      const top = target.getBoundingClientRect().top + window.scrollY - 128;
      window.scrollTo({ top: Math.max(top, 0), behavior });
    };

    const updateFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        scrollToSection(hash, "auto");
        setActiveId(hash);
      }
    };

    const onScroll = () => {
      const scrollY = window.scrollY + 160;
      let current = "overview";

      for (const section of vaultSections) {
        const element = document.getElementById(section.id);
        if (!element) {
          continue;
        }
        if (element.offsetTop <= scrollY) {
          current = section.id;
        }
      }

      setActiveId(current);
    };

    updateFromHash();
    onScroll();

    window.addEventListener("hashchange", updateFromHash);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("hashchange", updateFromHash);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="g-glass mb-4 flex flex-wrap gap-2 p-2">
      {vaultSections.map((section) => {
        const active = activeId === section.id;

        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(event) => {
              event.preventDefault();
              const target = document.getElementById(section.id);
              if (!target) {
                return;
              }
              window.history.replaceState(null, "", `#${section.id}`);
              const top = target.getBoundingClientRect().top + window.scrollY - 128;
              window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
              setActiveId(section.id);
            }}
            className={cx(
              "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition",
              active
                ? "bg-accent g-on-accent"
                : "border border-white/20 bg-white/5 text-slate-300 hover:border-white/40 hover:text-white"
            )}
          >
            {section.label}
          </a>
        );
      })}
    </div>
  );
}
