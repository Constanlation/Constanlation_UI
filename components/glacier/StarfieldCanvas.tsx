"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  layer: number;
}

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const count = Math.min(220, Math.floor((window.innerWidth * window.innerHeight) / 6000));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const layer = Math.random() < 0.5 ? 0 : Math.random() < 0.6 ? 1 : 2;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: layer === 0 ? 0.5 + Math.random() * 0.8 : layer === 1 ? 1 + Math.random() * 1.2 : 1.5 + Math.random() * 2,
        opacity: layer === 0 ? 0.08 + Math.random() * 0.15 : layer === 1 ? 0.15 + Math.random() * 0.3 : 0.3 + Math.random() * 0.5,
        speedX: (layer + 1) * (0.02 + Math.random() * 0.06) * (Math.random() > 0.5 ? 1 : -1),
        speedY: -(layer + 1) * (0.05 + Math.random() * 0.12),
        layer,
      });
    }
    particlesRef.current = particles;

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        const parallaxFactor = (p.layer + 1) * 8;
        const drawX = p.x + mx * parallaxFactor;
        const drawY = p.y + my * parallaxFactor;

        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);

        // Unified color: mix of white and laser yellow (#FFF64B)
        const isAccent = (Math.floor(p.x * 13 + p.y * 7) % 5) === 0;
        if (isAccent) {
          ctx.fillStyle = `rgba(255, 246, 75, ${p.opacity * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        }
        ctx.fill();

        // Glow for brightest particles
        if (p.opacity > 0.4 && p.size > 2) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, p.size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.size * 3);
          if (isAccent) {
            gradient.addColorStop(0, `rgba(255, 246, 75, ${p.opacity * 0.12})`);
          } else {
            gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity * 0.1})`);
          }
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
