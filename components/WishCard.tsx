"use client";

import { useState } from "react";
import type { Wish } from "@/lib/types";
import { formatThaiDateTime } from "@/lib/format";

const AVATAR_GRADIENTS = [
  "from-[#f3b6cb] to-[#c8709c]",
  "from-[#e8d3a8] to-[#c9a86a]",
  "from-[#e9c3dd] to-[#a8648c]",
  "from-[#f5c9c0] to-[#d48a8a]",
];

export default function WishCard({ wish, index = 0 }: { wish: Wish; index?: number }) {
  const [open, setOpen] = useState<string | null>(null);
  // Skip Thai leading vowels (เ แ โ ใ ไ) so "เอ" shows "อ", not "เ".
  const initial = Array.from(wish.name.trim().replace(/^[เแโใไ]+/, ""))[0] ?? "♥";
  const gradient = AVATAR_GRADIENTS[wish.name.length % AVATAR_GRADIENTS.length];
  const photos = wish.photo_urls;

  return (
    <article
      className="glass animate-fade-up rounded-3xl p-5"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <header className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${gradient} font-heading text-lg font-medium text-white shadow-sm`}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading font-medium leading-tight">{wish.name}</p>
          <p className="truncate text-sm text-plum/60" suppressHydrationWarning>
            {wish.relation ? `${wish.relation} · ` : ""}
            {formatThaiDateTime(wish.created_at)}
          </p>
        </div>
      </header>

      <p className="mt-4 whitespace-pre-wrap wrap-break-word text-[17px] leading-relaxed">
        {wish.message}
      </p>

      {photos.length > 0 && (
        <div
          className={`mt-4 grid gap-2 ${
            photos.length === 1 ? "grid-cols-1" : photos.length === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {photos.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => setOpen(url)}
              className={`overflow-hidden rounded-2xl bg-rose-soft/50 ${
                photos.length === 1 ? "aspect-4/3" : "aspect-square"
              }`}
              aria-label="ดูรูปขนาดใหญ่"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-plum/70 p-4 backdrop-blur-md"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={open}
            alt=""
            className="animate-pop max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          <button
            type="button"
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-2xl text-plum shadow"
            aria-label="ปิด"
          >
            ×
          </button>
        </div>
      )}
    </article>
  );
}
