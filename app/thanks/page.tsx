import Link from "next/link";
import FloralCorners from "@/components/FloralCorners";
import PetalFall from "@/components/PetalFall";

export default function ThanksPage() {
  return (
    <main className="relative isolate mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <FloralCorners />
      <PetalFall />

      <div className="glass relative w-full animate-fade-up rounded-[2rem] px-6 pb-8 pt-12">
        <div className="absolute -top-10 left-1/2 flex h-20 w-20 -translate-x-1/2 animate-pop items-center justify-center rounded-full bg-linear-to-br from-[#f3b6cb] to-[#c8709c] text-4xl shadow-lg shadow-rose-deep/30 ring-4 ring-white">
          💐
        </div>

        <p className="text-xs font-medium tracking-[0.25em] text-gold">THANK YOU</p>
        <h1 className="mt-3 font-heading text-[1.7rem] font-semibold leading-snug">
          ขอบคุณสำหรับคำอวยพรนะคะ
        </h1>
        <p className="mt-3 text-plum/80">
          <span className="font-display text-xl font-semibold">
            <span className="text-gradient">Anis</span>
            <span className="mx-1 italic text-gold">&amp;</span>
            <span className="text-gradient">Usman</span>
          </span>{" "}
          ได้รับคำอวยพรของคุณแล้ว
          <br />
          ขอให้สนุกกับงานนะคะ 💕
        </p>

        <Link
          href="/"
          className="btn-primary mt-8 flex min-h-14 w-full items-center justify-center rounded-full px-6 font-heading text-lg font-medium text-white"
        >
          ดูคำอวยพรทั้งหมด
        </Link>
        <Link
          href="/wish"
          className="mt-3 flex min-h-12 w-full items-center justify-center rounded-full border border-rose-mid/50 bg-white/70 px-6 font-heading text-rose-deep transition active:scale-[0.98]"
        >
          ส่งคำอวยพรอีกครั้ง
        </Link>
      </div>
    </main>
  );
}
