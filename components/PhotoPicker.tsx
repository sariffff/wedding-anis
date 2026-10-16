"use client";

import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { LIMITS } from "@/lib/types";

export type PickedPhoto = { id: string; file: File; preview: string };

type Props = {
  photos: PickedPhoto[];
  onChange: (photos: PickedPhoto[]) => void;
  onBusyChange: (busy: boolean) => void;
  disabled?: boolean;
};

export default function PhotoPicker({
  photos,
  onChange,
  onBusyChange,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview));
  }, []);

  const remaining = LIMITS.photos - photos.length;

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setError(null);
    const files = Array.from(list).slice(0, remaining);
    if (list.length > remaining) {
      setError(`เลือกได้สูงสุด ${LIMITS.photos} รูปค่ะ`);
    }

    setBusy(true);
    onBusyChange(true);
    const added: PickedPhoto[] = [];
    for (const file of files) {
      try {
        const compressed = await imageCompression(file, {
          maxWidthOrHeight: 1600,
          maxSizeMB: 0.5,
          useWebWorker: true,
          fileType: "image/jpeg",
          initialQuality: 0.8,
        });
        const jpg = new File([compressed], "photo.jpg", { type: "image/jpeg" });
        added.push({
          id: crypto.randomUUID(),
          file: jpg,
          preview: URL.createObjectURL(jpg),
        });
      } catch (e) {
        console.error("compress failed", e);
        setError("บางรูปใช้ไม่ได้ ลองเลือกรูปอื่นนะคะ");
      }
    }
    onChange([...photosRef.current, ...added].slice(0, LIMITS.photos));
    setBusy(false);
    onBusyChange(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(id: string) {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.preview);
    onChange(photos.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((p) => (
          <div
            key={p.id}
            className="relative aspect-square animate-pop overflow-hidden rounded-2xl bg-rose-soft shadow-sm ring-1 ring-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(p.id)}
              disabled={disabled}
              className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-plum/60 text-xl text-white backdrop-blur"
              aria-label="ลบรูปนี้"
            >
              ×
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy || disabled}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-rose-mid/60 bg-white/60 text-rose-deep transition active:scale-95 disabled:opacity-60"
          >
            {busy ? (
              <>
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-rose-soft border-t-rose-deep" />
                <span className="text-xs">กำลังเตรียม…</span>
              </>
            ) : (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-soft/70 text-xl">
                  📷
                </span>
                <span className="text-sm font-medium">เพิ่มรูป</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
