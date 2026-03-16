"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}

/**
 * A reusable glassmorphic card component that uses the refined
 * glass styles defined in app globals.css.
 */
export default function GlassCard({ 
  children, 
  className = "", 
  strong = false 
}: GlassCardProps) {
  return (
    <div className={`${strong ? "g-glass-strong" : "g-glass"} ${className}`}>
      {children}
    </div>
  );
}
