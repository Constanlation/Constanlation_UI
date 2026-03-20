"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const beams = [
  { className: "left-[8%] top-[12%] h-52 w-px", duration: 14, delay: 0.2 },
  { className: "left-[24%] top-[48%] h-64 w-px", duration: 18, delay: 1.4 },
  { className: "right-[22%] top-[18%] h-72 w-px", duration: 16, delay: 0.8 },
  { className: "right-[10%] top-[58%] h-56 w-px", duration: 20, delay: 2.1 },
];

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,246,75,0.08),transparent_52%)] opacity-60" />
      {beams.map((beam) => (
        <motion.div
          key={beam.className}
          className={cn(
            "absolute rounded-full bg-gradient-to-b from-white/0 via-[rgba(255,246,75,0.45)] to-white/0 blur-[1px]",
            beam.className,
          )}
          animate={{
            opacity: [0.08, 0.55, 0.12],
            scaleY: [0.85, 1.15, 0.92],
            y: [-24, 18, -12],
          }}
          transition={{
            duration: beam.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: beam.delay,
          }}
        />
      ))}
    </div>
  );
}

export default BackgroundBeams;
