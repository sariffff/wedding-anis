import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";

export const COUPLE_PHOTO = "/couple.jpg";

// Pages using this are prerendered at build time, so checking public/ here is safe.
export function hasCouplePhoto() {
  return existsSync(path.join(process.cwd(), "public", COUPLE_PHOTO));
}

// Arch-framed couple photo, wedding-invitation style.
export default function CouplePhoto({ className = "" }: { className?: string }) {
  if (!hasCouplePhoto()) return null;

  return (
    <div className={`relative mx-auto ${className}`}>
      <div className="absolute -inset-2 rounded-t-full rounded-b-3xl border border-gold/50" />
      <div className="relative aspect-3/4 overflow-hidden rounded-t-full rounded-b-3xl shadow-[0_20px_40px_-18px_rgb(90_46_68/0.45)] ring-4 ring-white">
        <Image
          src={COUPLE_PHOTO}
          alt="Anis & Usman"
          fill
          priority
          sizes="(max-width: 640px) 70vw, 320px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
