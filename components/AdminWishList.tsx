"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePhoto, deleteWish } from "@/app/admin/actions";
import { formatThaiDateTime } from "@/lib/format";
import type { Wish } from "@/lib/types";

export default function AdminWishList({ wishes }: { wishes: Wish[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  function run(key: string, question: string, action: () => Promise<void>) {
    if (!window.confirm(question)) return;
    setBusyKey(key);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (e) {
        window.alert(`ลบไม่สำเร็จ: ${e instanceof Error ? e.message : e}`);
      } finally {
        setBusyKey(null);
      }
    });
  }

  if (wishes.length === 0) {
    return <p className="glass rounded-3xl p-6 text-center text-plum/70">ยังไม่มีคำอวยพร</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-plum/60">ทั้งหมด {wishes.length} รายการ</p>
      {wishes.map((w) => {
        const busy = pending && busyKey?.startsWith(w.id);
        return (
          <article key={w.id} className={`glass rounded-3xl p-5 transition ${busy ? "opacity-50" : ""}`}>
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-heading font-medium">{w.name}</p>
                <p className="truncate text-sm text-plum/60" suppressHydrationWarning>
                  {w.relation ? `${w.relation} · ` : ""}
                  {formatThaiDateTime(w.created_at)}
                </p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(w.id, `ลบคำอวยพรของ "${w.name}" และรูปทั้งหมด?`, () => deleteWish(w.id))
                }
                className="shrink-0 rounded-full bg-rose-deep px-4 py-2 text-sm font-medium text-white transition active:scale-95 disabled:opacity-50"
              >
                ลบคำอวยพร
              </button>
            </header>

            <p className="mt-3 whitespace-pre-wrap wrap-break-word">{w.message}</p>

            {w.photo_urls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {w.photo_urls.map((url) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-2xl bg-rose-soft/50">
                    <a href={url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </a>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        run(`${w.id}:${url}`, "ลบรูปนี้?", () => deletePhoto(w.id, url))
                      }
                      className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg text-rose-deep shadow disabled:opacity-50"
                      aria-label="ลบรูปนี้"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
