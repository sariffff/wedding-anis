import QRCode from "qrcode";
import CouplePhoto, { hasCouplePhoto } from "@/components/CouplePhoto";
import FloralCorners from "@/components/FloralCorners";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = { title: "QR Poster — Anis & Usman" };

export default async function PosterPage() {
  const withPhoto = hasCouplePhoto();
  const svg = await QRCode.toString(SITE_URL, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#5A2E44", light: "#FFFFFF" },
  });

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <style>{`@page { size: A5 portrait; margin: 0; }`}</style>

      <p className="no-print mb-4 text-center text-sm text-plum/70">
        กด Ctrl+P / พิมพ์ → ขนาดกระดาษ A5 · URL: {SITE_URL}
      </p>

      <div className="bg-glow relative isolate flex aspect-148/210 w-full max-w-[148mm] flex-col items-center justify-center overflow-hidden rounded-2xl border border-rose-mid/50 p-8 text-center print:rounded-none print:border-0 [print-color-adjust:exact]">
        <FloralCorners contained />
        <p className="text-xs font-medium tracking-[0.3em] text-gold">THE WEDDING OF</p>

        {withPhoto && <CouplePhoto className="mt-5 w-[38%]" />}

        <h1 className={`${withPhoto ? "mt-4 text-5xl" : "mt-3 text-6xl"} font-display font-semibold leading-none`}>
          <span className="text-gradient">Anis</span>
          <span className="mx-2 italic text-gold">&amp;</span>
          <span className="text-gradient">Usman</span>
        </h1>
        <p className="mt-3 font-heading text-sm tracking-[0.2em]">17 · 10 · 2026</p>

        <div
          className={`${withPhoto ? "mt-5 w-[42%]" : "mt-8 w-3/5"} rounded-2xl bg-white p-3 shadow-sm [&>svg]:h-auto [&>svg]:w-full`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <p className={`${withPhoto ? "mt-4 text-xl" : "mt-8 text-2xl"} font-heading font-medium text-rose-deep`}>
          สแกนเพื่อส่งคำอวยพร 💌
        </p>
        <p className="mt-2 text-base">
          เปิดกล้องมือถือ แล้วส่องที่ QR นี้
          <br />
          ฝากคำอวยพรและรูปภาพให้บ่าวสาวได้เลย
        </p>
      </div>
    </main>
  );
}
