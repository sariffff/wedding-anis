import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import AdminWishList from "@/components/AdminWishList";
import { getAdminSupabase } from "@/lib/supabase-admin";
import type { Wish } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

async function AllWishes() {
  await connection();

  if (!process.env.SUPABASE_SECRET_KEY) {
    return (
      <p className="glass rounded-3xl p-6 text-center text-rose-deep">
        ยังไม่ได้ตั้งค่า SUPABASE_SECRET_KEY
      </p>
    );
  }

  const { data, error } = await getAdminSupabase()
    .from("wishes")
    .select("id, name, relation, message, photo_urls, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return <p className="glass rounded-3xl p-6 text-center text-rose-deep">โหลดไม่สำเร็จ: {error.message}</p>;
  }
  return <AdminWishList wishes={(data ?? []) as Wish[]} />;
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
      <h1 className="font-heading text-2xl font-semibold">จัดการคำอวยพร</h1>
      <p className="mt-1 text-sm text-plum/60">ลบแล้วกู้คืนไม่ได้ (ทั้งข้อความและรูป)</p>

      <div className="mt-6">
        <Suspense fallback={<p className="text-center text-plum/60">กำลังโหลด…</p>}>
          <AllWishes />
        </Suspense>
      </div>
    </main>
  );
}
