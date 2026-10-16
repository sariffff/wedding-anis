"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FloralCorners from "@/components/FloralCorners";
import PhotoPicker, { type PickedPhoto } from "@/components/PhotoPicker";
import { supabase, PHOTO_BUCKET } from "@/lib/supabase";
import { LIMITS } from "@/lib/types";
import { refreshWishes } from "./actions";

const DRAFT_KEY = "wish-draft";
const NAME_KEY = "wish-name";
const LAST_SENT_KEY = "wish-last-sent";
const COOLDOWN_MS = 30_000;

type Draft = { name: string; relation: string; message: string };

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode) — ignore
  }
}

const inputClass =
  "w-full rounded-2xl border border-rose-mid/40 bg-white/80 px-4 py-3.5 text-[17px] text-plum shadow-[inset_0_1px_2px_rgb(90_46_68/0.06)] transition placeholder:text-plum/35 focus:border-rose-deep focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-soft/60 disabled:opacity-60";

const labelClass = "mb-2 flex items-baseline justify-between font-heading font-medium";

export default function WishPage() {
  const router = useRouter();
  const [form, setForm] = useState<Draft>({ name: "", relation: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore draft (iOS may reload the page after opening the camera).
  useEffect(() => {
    const raw = readStorage(DRAFT_KEY);
    let draft: Partial<Draft> = {};
    if (raw) {
      try {
        draft = JSON.parse(raw);
      } catch {}
    }
    const savedName = readStorage(NAME_KEY) ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
    setForm({
      name: draft.name ?? savedName,
      relation: draft.relation ?? "",
      message: draft.message ?? "",
    });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeStorage(DRAFT_KEY, JSON.stringify(form));
  }, [form, loaded]);

  function update<K extends keyof Draft>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending || preparing) return;
    setError(null);

    const name = form.name.trim();
    const relation = form.relation.trim();
    const message = form.message.trim();

    if (!name) return setError("กรุณาใส่ชื่อของคุณนะคะ");
    if (!message) return setError("กรุณาเขียนคำอวยพรนะคะ");
    if (name.length > LIMITS.name || relation.length > LIMITS.relation || message.length > LIMITS.message) {
      return setError("ข้อความยาวเกินไปค่ะ");
    }

    if (honeypot) {
      router.push("/thanks");
      return;
    }

    const last = Number(readStorage(LAST_SENT_KEY) ?? 0);
    if (Date.now() - last < COOLDOWN_MS) {
      return setError("เพิ่งส่งไปเมื่อสักครู่ รอสักครู่แล้วลองใหม่นะคะ");
    }

    setSending(true);
    try {
      const photoUrls: string[] = [];
      for (const p of photos) {
        const path = `${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, p.file, { contentType: "image/jpeg", upsert: false });
        if (upErr) throw upErr;
        photoUrls.push(supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl);
      }

      const { error: insErr } = await supabase.from("wishes").insert({
        name,
        relation: relation || null,
        message,
        photo_urls: photoUrls,
      });
      if (insErr) throw insErr;

      writeStorage(LAST_SENT_KEY, String(Date.now()));
      writeStorage(NAME_KEY, name);
      writeStorage(DRAFT_KEY, null);
      await refreshWishes().catch(() => {});
      router.push("/thanks");
    } catch (err) {
      console.error("submit failed", err);
      setError("ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะคะ");
      setSending(false);
    }
  }

  const busy = sending || preparing;

  return (
    <main className="relative isolate mx-auto w-full max-w-xl flex-1 px-5 pb-32 pt-6">
      <FloralCorners />

      <Link
        href="/"
        className="glass inline-flex min-h-11 items-center gap-1 rounded-full px-4 text-sm text-plum/80"
      >
        ← กลับ
      </Link>

      <div className="mt-6 animate-fade-up text-center">
        <p className="text-xs font-medium tracking-[0.25em] text-gold">A NOTE FOR</p>
        <h1 className="mt-2 font-display text-5xl font-semibold">
          <span className="text-gradient">Anis</span>
          <span className="mx-2 italic text-gold">&amp;</span>
          <span className="text-gradient">Usman</span>
        </h1>
        <p className="mt-2 text-plum/75">เขียนคำอวยพรจากใจถึงบ่าวสาว 💌</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass mt-8 flex animate-fade-up flex-col gap-6 rounded-3xl p-5 [animation-delay:120ms]"
        noValidate
      >
        <div>
          <label htmlFor="name" className={labelClass}>
            <span>ชื่อของคุณ <span className="text-rose-deep">*</span></span>
          </label>
          <input
            id="name"
            className={inputClass}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            maxLength={LIMITS.name}
            autoComplete="name"
            placeholder="เช่น ป้าสมศรี"
            disabled={sending}
          />
        </div>

        <div>
          <label htmlFor="relation" className={labelClass}>
            <span>ความสัมพันธ์</span>
            <span className="text-sm font-normal text-plum/50">ไม่บังคับ</span>
          </label>
          <input
            id="relation"
            className={inputClass}
            value={form.relation}
            onChange={(e) => update("relation", e.target.value)}
            maxLength={LIMITS.relation}
            placeholder="เช่น เพื่อนเจ้าบ่าว, ญาติฝ่ายเจ้าสาว"
            disabled={sending}
          />
        </div>

        <div>
          <label htmlFor="message" className={labelClass}>
            <span>คำอวยพร <span className="text-rose-deep">*</span></span>
            <span
              className={`text-sm font-normal tabular-nums ${
                form.message.length > LIMITS.message - 50 ? "text-rose-deep" : "text-plum/50"
              }`}
            >
              {form.message.length}/{LIMITS.message}
            </span>
          </label>
          <textarea
            id="message"
            rows={6}
            className={`${inputClass} resize-none`}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            maxLength={LIMITS.message}
            placeholder="ขอให้มีความสุขมากๆ นะ…"
            disabled={sending}
          />
        </div>

        <div>
          <p className={labelClass}>
            <span>รูปภาพ</span>
            <span className="text-sm font-normal text-plum/50">ไม่บังคับ · สูงสุด {LIMITS.photos} รูป</span>
          </p>
          <PhotoPicker
            photos={photos}
            onChange={setPhotos}
            onBusyChange={setPreparing}
            disabled={sending}
          />
        </div>

        {/* Honeypot: hidden from people, bots tend to fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="animate-fade-up rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-red-700"
          >
            {error}
          </p>
        )}

        {/* Sticky submit so it's always within thumb reach */}
        <div className="sticky bottom-0 -mx-5 -mb-5 rounded-b-3xl bg-linear-to-t from-white/95 via-white/80 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
          <button
            type="submit"
            disabled={busy}
            className="btn-primary flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-6 font-heading text-lg font-medium text-white disabled:opacity-60"
          >
            {sending && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {sending ? "กำลังส่ง…" : preparing ? "กำลังเตรียมรูป…" : "ส่งคำอวยพร 💌"}
          </button>
        </div>
      </form>
    </main>
  );
}
