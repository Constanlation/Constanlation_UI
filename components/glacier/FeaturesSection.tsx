"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import GlassCard from "./GlassCard";

const features = [
  {
    num: "01",
    title: "Curated Strategy Registry",
    desc: "Every strategy enters through governance review and multi-signature checks before capital is admitted, reducing avoidable protocol risk.",
    stat: "4/4 Approved",
    tag: "Security",
  },
  {
    num: "02",
    title: "Active Guardian Controls",
    desc: "Institutional guardians monitor real-time conditions and can trigger clearly defined circuit breakers with full on-chain visibility.",
    stat: "14ms Latency",
    tag: "Governance",
  },
  {
    num: "03",
    title: "Predictable Exit Queues",
    desc: "Withdrawal prioritization follows transparent rules tied to liquidity and tenure, giving participants clear expectations during redemptions.",
    stat: "2.8x Coverage",
    tag: "Liquidity",
  },
  {
    num: "04",
    title: "Cross-Chain Capital Efficiency",
    desc: "Allocate across leading Polkadot ecosystem venues with isolated buffers and unified oversight to improve risk-adjusted yield outcomes.",
    stat: "18.4% Buffer",
    tag: "Strategy",
  },
];

export default function FeaturesSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxTravel, setMaxTravel] = useState(0);
  const [sectionHeight, setSectionHeight] = useState("260vh");
  const prefersReducedMotion = useReducedMotion();
  const sectionInView = useInView(targetRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.9],
    [0, prefersReducedMotion ? 0 : -maxTravel],
  );

  useEffect(() => {
    const getTranslateX = (el: HTMLElement) => {
      const transform = window.getComputedStyle(el).transform;

      if (!transform || transform === "none") {
        return 0;
      }

      const matrix3dMatch = transform.match(/matrix3d\(([^)]+)\)/);
      if (matrix3dMatch) {
        const values = matrix3dMatch[1].split(",").map((v) => Number(v.trim()));
        return Number.isFinite(values[12]) ? values[12] : 0;
      }

      const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
      if (matrixMatch) {
        const values = matrixMatch[1].split(",").map((v) => Number(v.trim()));
        return Number.isFinite(values[4]) ? values[4] : 0;
      }

      return 0;
    };

    const updateTravel = () => {
      if (!trackRef.current) {
        return;
      }

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const trackTranslateX = getTranslateX(trackRef.current);

      const cardHeads = trackRef.current.querySelectorAll("h3");
      const lastCardHead = cardHeads.item(cardHeads.length - 1);

      let lastCardRoot: HTMLElement | null = lastCardHead
        ? (lastCardHead.parentElement as HTMLElement | null)
        : null;

      while (lastCardRoot && !String(lastCardRoot.className).includes("shrink-0")) {
        lastCardRoot = lastCardRoot.parentElement as HTMLElement | null;
      }

      const fallbackTrackWidth = trackRef.current.scrollWidth;
      const fallbackTravel = Math.max(fallbackTrackWidth - viewportWidth, 0);

      const revealBuffer = 24;
      const travel = lastCardRoot
        ? Math.max(
            lastCardRoot.getBoundingClientRect().right - trackTranslateX - viewportWidth + revealBuffer,
            0,
          )
        : fallbackTravel;

      setMaxTravel(travel);

      const adaptiveHeight = Math.max(
        viewportHeight * 2.4,
        viewportHeight + travel + viewportHeight * 0.7,
      );
      setSectionHeight(`${Math.round(adaptiveHeight)}px`);
    };

    updateTravel();

    const resizeObserver = new ResizeObserver(() => updateTravel());

    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }

    window.addEventListener("resize", updateTravel);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateTravel);
    };
  }, []);

  return (
    <section ref={targetRef} style={{ height: sectionHeight }} className="relative bg-transparent">
      <div className="sticky top-0 h-screen flex flex-col items-center overflow-x-clip overflow-y-visible pt-14 md:pt-20 lg:pt-28">
        <div className="glacier-container w-full mb-8 md:mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 1 }}
            className="text-left"
          >
            <span className="g-label mb-6">Built for Confidence</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter">
              Institutional Design <br />
              <span className="g-text-accent">Transparent Operations</span>
            </h2>
          </motion.div>
        </div>

        <div className="glacier-container w-full">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="pl-3 flex gap-20 md:gap-32 lg:gap-64 w-max mt-4 md:mt-8 lg:mt-12"
          >
            {features.map((feature, idx) => (
            <motion.div
              key={feature.num}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={
                sectionInView
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.94, opacity: 0 }
              }
              transition={{
                duration: prefersReducedMotion ? 0.1 : 0.8,
                delay: prefersReducedMotion ? 0 : idx * 0.08,
              }}
              className="w-[82vw] max-w-[360px] sm:w-[380px] lg:w-[450px] shrink-0 origin-left"
            >
              <GlassCard
                className="relative p-7 sm:p-9 lg:p-12 h-[420px] sm:h-[470px] lg:h-[540px] flex flex-col justify-between group overflow-hidden border-white/5"
                strong
              >
                <div className="absolute top-0 right-0 p-8 text-7xl font-black text-white/5 group-hover:text-accent/10 transition-colors">
                  {feature.num}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] uppercase font-bold text-accent tracking-widest">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-6 tracking-tight group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">
                    Control Metric
                  </p>
                  <p className="text-2xl font-black text-white">
                    {feature.stat}
                  </p>
                </div>

                {/* Reflection effect */}
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] duration-[1500ms] pointer-events-none" />
              </GlassCard>
            </motion.div>
            ))}

          </motion.div>
        </div>
      </div>
    </section>
  );
}
