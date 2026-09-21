"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  emoji: string;
  dx: number;
  duration: number;
  size: number;
};

let particleId = 0;

export default function MoneyCursor() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const lastSpawn = useRef(0);

  useEffect(() => {
    const emojis = ["🌸", "🌺", "🌼", "💮", "🌷"];

    const handleMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      const now = Date.now();
      if (now - lastSpawn.current < 80) return;
      lastSpawn.current = now;

      const randomDx = Math.random() * 60 - 30;
      const randomDuration = 700 + Math.random() * 400;
      const randomSize = 14 + Math.random() * 10;
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      const newParticle: Particle = {
        id: particleId++,
        x: e.clientX,
        y: e.clientY,
        emoji: randomEmoji,
        dx: randomDx,
        duration: randomDuration,
        size: randomSize,
      };

      setParticles((prev) => [...prev, newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, newParticle.duration);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      <style jsx global>{`
        html,
        body,
        * {
          cursor: none !important;
        }

        @keyframes flowerFall {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--dx), 70px) rotate(120deg);
            opacity: 0;
          }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          left: cursorPos.x,
          top: cursorPos.y,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
          fontSize: 22,
        }}
      >
        🌸
      </div>

      {particles.map((p) => (
        <div
          key={p.id}
          style={
            {
              position: "fixed",
              left: p.x,
              top: p.y,
              pointerEvents: "none",
              zIndex: 9998,
              fontSize: p.size,
              "--dx": `${p.dx}px`,
              animation: `flowerFall ${p.duration}ms ease-in forwards`,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </div>
      ))}
    </>
  );
}