"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

type MeteorsProps = {
  className?: string;
  count?: number;
};

function seededUnit(index: number, salt: number): number {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function Meteors({ className, count = 18 }: MeteorsProps) {
  const meteors = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        delay: seededUnit(index, count) * 8,
        duration: 3 + seededUnit(index, count + 1) * 5,
        left: `${seededUnit(index, count + 2) * 100}%`,
        top: `${seededUnit(index, count + 3) * 60}%`,
      })),
    [count],
  );

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="meteor-trail absolute h-px w-32 rounded-full bg-gradient-to-r from-[rgba(255,246,75,0)] via-[rgba(255,246,75,0.7)] to-white/80"
          style={{
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`,
            left: meteor.left,
            top: meteor.top,
          }}
        />
      ))}
    </div>
  );
}

export default Meteors;
