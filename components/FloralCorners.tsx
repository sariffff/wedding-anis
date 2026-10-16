// Soft floating color orbs + a faint floral accent behind the content.
// `contained` keeps it inside the parent box (poster); otherwise it fills the viewport.
export default function FloralCorners({ contained = false }: { contained?: boolean }) {
  return (
    <div
      className={`pointer-events-none ${contained ? "absolute" : "fixed"} inset-0 -z-10 overflow-hidden`}
      aria-hidden="true"
    >
      <div className="absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-rose-soft/70 blur-3xl" />
      <div
        className="absolute -right-20 top-40 h-60 w-60 animate-float rounded-full bg-gold/20 blur-3xl"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="absolute -bottom-24 left-1/4 h-72 w-72 animate-float rounded-full bg-rose-mid/30 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <svg
        viewBox="0 0 120 120"
        className="absolute -right-6 top-6 w-28 opacity-40"
        fill="none"
      >
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="60"
            cy="36"
            rx="12"
            ry="22"
            fill="#EEC3CD"
            transform={`rotate(${deg} 60 60)`}
          />
        ))}
        <circle cx="60" cy="60" r="7" fill="#C9A86A" />
      </svg>
    </div>
  );
}
