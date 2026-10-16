import Link from "next/link";
import CouplePhoto from "@/components/CouplePhoto";
import FloralCorners from "@/components/FloralCorners";
import WishCard from "@/components/WishCard";
import { getLatestWishes } from "@/lib/wishes";

export default async function Home() {
  const wishes = await getLatestWishes();

  return (
    <main className="relative isolate mx-auto w-full max-w-xl flex-1 px-5 pb-32 pt-14">
      <FloralCorners />

      <header className="animate-fade-up text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-[0.25em] text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          THE WEDDING OF
        </span>

        <CouplePhoto className="mt-8 w-[68%] max-w-[300px] animate-pop" />

        <h1 className="mt-6 font-display text-[3.6rem] font-semibold leading-[0.95] sm:text-7xl">
          <span className="text-gradient">Anis</span>
          <span className="mx-2 font-display italic text-gold">&amp;</span>
          <span className="text-gradient">Usman</span>
        </h1>

        <div className="mt-5 flex items-center justify-center gap-3 font-heading text-base tracking-[0.2em] text-plum/80">
          <span className="h-px w-10 bg-linear-to-r from-transparent to-gold" />
          17 · 10 · 2026
          <span className="h-px w-10 bg-linear-to-l from-transparent to-gold" />
        </div>

        <p className="mx-auto mt-6 max-w-sm text-[17px] text-plum/85">
          ขอบคุณที่มาร่วมแสดงความยินดีกับเรานะคะ
          <br />
          ฝากคำอวยพรและรูปภาพไว้เป็นที่ระลึกได้เลย 💕
        </p>
      </header>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-heading text-xl font-medium">คำอวยพรจากแขก</h2>
          <span className="glass rounded-full px-3 py-1 text-sm text-rose-deep">
            💌 {wishes.length}
          </span>
        </div>

        {wishes.length === 0 ? (
          <div className="glass rounded-3xl px-6 py-10 text-center">
            <p className="text-4xl">✨</p>
            <p className="mt-3">ยังไม่มีคำอวยพร</p>
            <p className="text-plum/70">มาเป็นคนแรกกันนะคะ</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {wishes.map((w, i) => (
              <WishCard key={w.id} wish={w} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Floating CTA — always reachable on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-linear-to-t from-cream via-cream/90 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8">
        <Link
          href="/wish"
          className="btn-primary mx-auto flex min-h-14 w-full max-w-xl items-center justify-center gap-2 rounded-full px-6 font-heading text-lg font-medium text-white"
        >
          ส่งคำอวยพร <span aria-hidden="true">💌</span>
        </Link>
      </div>
    </main>
  );
}
