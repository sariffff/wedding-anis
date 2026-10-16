import type { CSSProperties } from "react";

// Deterministic pseudo-random so server and client render the same petals.
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const PETALS = Array.from({ length: 22 }, (_, i) => ({
  left: rand(i + 1) * 100,
  size: 10 + rand(i + 50) * 12,
  duration: 7 + rand(i + 100) * 6,
  delay: -rand(i + 150) * 12,
  drift: (rand(i + 200) - 0.5) * 120,
  color: ["#EEC3CD", "#D9A0B8", "#F5D5DD", "#C8709C"][i % 4],
}));

export default function PetalFall() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.8,
              background: p.color,
              borderRadius: "80% 0 80% 0",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
