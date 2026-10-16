# เว็บอวยพรงานแต่ง Anis & Usman — Implementation Plan

## Context
- เว็บให้แขกในงานแต่งสแกน QR แล้วส่งคำอวยพร + ชื่อผู้ส่ง + รูปภาพ
- งานแต่ง: **วันเสาร์ที่ 17 ตุลาคม 2026** (ต้องเสร็จและทดสอบภายในคืนวันที่ 16)
- ผู้ใช้ส่วนใหญ่ใช้มือถือ มีผู้ใหญ่ใช้งานด้วย → **mobile-first, ปุ่มใหญ่, อ่านง่าย**
- ไม่มีระบบล็อกอิน, ไม่มีหน้า Admin, ไม่มี Live Wall
- การซ่อน/ลบข้อความไม่เหมาะสม ทำผ่าน Supabase Dashboard (ตั้ง `is_hidden = true`)

## Tech Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Supabase (Postgres + Storage)
- `@supabase/supabase-js`, `browser-image-compression`
- ฟอนต์: Prompt (หัวข้อ), Sarabun (เนื้อหา) ผ่าน `next/font/google`
- Deploy: Vercel

## Design Tokens
| Token | Hex | ใช้กับ |
|---|---|---|
| `rose-deep` | `#C8709C` | ปุ่มหลัก, หัวข้อ, ชื่อบ่าวสาว |
| `rose-mid` | `#D9A0B8` | เส้นขอบ, ไอคอน, กรอบการ์ด |
| `rose-soft` | `#EEC3CD` | พื้นหลังการ์ด, input |
| `cream` | `#FFF8F9` | พื้นหลังทั้งหน้า |
| `plum` | `#5A2E44` | สีตัวอักษรเนื้อหา |
| `gold` (optional) | `#C9A86A` | เส้นตกแต่งเล็กน้อย |

แนวทาง UI:
- การ์ดมุมโค้ง (rounded-2xl), เงาบาง
- ลายดอกไม้พาสเทลจางๆ ที่มุมบน/ล่างของหน้า
- ปุ่มสูงอย่างน้อย 48px, ตัวอักษรเนื้อหาอย่างน้อย 16px
- เอฟเฟกต์กลีบดอกไม้ร่วงสีชมพูในหน้าขอบคุณ

## Pages
1. `/` — หน้าแรก
   - "Anis & Usman", วันที่ 17.10.2026, ข้อความต้อนรับสั้นๆ
   - ปุ่มใหญ่ "ส่งคำอวยพร 💌" → `/wish`
   - Feed คำอวยพรล่าสุด 50 รายการ (ใหม่ → เก่า), `export const revalidate = 30`
2. `/wish` — ฟอร์มส่งคำอวยพร (client component)
   - ชื่อผู้ส่ง (บังคับ, ≤ 50 ตัวอักษร)
   - ความสัมพันธ์ (ไม่บังคับ, ≤ 50 ตัวอักษร) เช่น "เพื่อนเจ้าบ่าว", "ญาติฝ่ายเจ้าสาว"
   - คำอวยพร (บังคับ, ≤ 500 ตัวอักษร, แสดงตัวนับ)
   - รูป 0–3 รูป (`accept="image/*"`, ถ่ายจากกล้องได้), มี preview และปุ่มลบรูป
   - ช่อง honeypot ซ่อน
3. `/thanks` — หน้าขอบคุณ + PetalFall + ปุ่มกลับหน้าแรก

## Project Structure
```
app/
  layout.tsx        ฟอนต์, พื้นหลัง cream, metadata
  page.tsx          หน้าแรก + feed (server component)
  wish/page.tsx     ฟอร์ม (client component)
  thanks/page.tsx
components/
  WishCard.tsx
  PhotoPicker.tsx
  PetalFall.tsx
  FloralCorners.tsx
lib/
  supabase.ts       createClient จาก env
  types.ts          type Wish
```

## Supabase Setup

### Table
```sql
create table wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 50),
  relation text check (char_length(relation) <= 50),
  message text not null check (char_length(message) between 1 and 500),
  photo_urls text[] not null default '{}',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table wishes enable row level security;

create policy "anon insert" on wishes for insert to anon
  with check (is_hidden = false and coalesce(array_length(photo_urls, 1), 0) <= 3);

create policy "anon read visible" on wishes for select to anon
  using (is_hidden = false);
```

### Storage
- Bucket: `wish-photos` (public)
- File size limit: 2MB, Allowed MIME types: `image/*`
- Policy: `anon` INSERT ได้เมื่อ `bucket_id = 'wish-photos'` เท่านั้น (ไม่อนุญาต update/delete)

### Env
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
เพิ่มโดเมน Supabase Storage ใน `images.remotePatterns` ของ `next.config`

## Submit Flow (`/wish`)
1. เลือกรูป → บีบอัดทันทีด้วย `browser-image-compression` (`maxWidthOrHeight: 1600`, `maxSizeMB: 0.5`, `useWebWorker: true`)
2. กดส่ง → validate ฝั่ง client → ถ้า honeypot มีค่า ให้ redirect ไป `/thanks` เงียบๆ
3. เช็ก localStorage: ถ้าส่งไปแล้วภายใน 30 วินาที ให้เตือนและไม่ส่ง
4. disable ปุ่ม, แสดง "กำลังส่ง…"
5. อัปโหลดรูปทีละไฟล์ไป `wish-photos/{crypto.randomUUID()}.jpg` → เก็บ public URL
6. insert ลง `wishes` (ไม่ต้อง `.select()` หลัง insert)
7. สำเร็จ → บันทึกเวลาใน localStorage → `router.push('/thanks')`
8. ล้มเหลว → แสดงข้อความภาษาไทย "ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะคะ" **ห้ามล้างข้อมูลในฟอร์ม**

## Tasks
- [ ] 1. สร้างตารางและ RLS policies ใน Supabase
- [ ] 2. สร้าง bucket `wish-photos` + storage policy
- [ ] 3. ตั้งโปรเจกต์ Next.js + Tailwind + ฟอนต์ + design tokens
- [ ] 4. `lib/supabase.ts`, `lib/types.ts`
- [ ] 5. `PhotoPicker` (เลือก, บีบอัด, preview, ลบ, จำกัด 3 รูป)
- [ ] 6. หน้า `/wish` + submit flow ครบตามข้างบน
- [ ] 7. หน้า `/thanks` + `PetalFall`
- [ ] 8. `WishCard` + หน้า `/` พร้อม feed
- [ ] 9. ตกแต่ง `FloralCorners`, เก็บรายละเอียด mobile
- [ ] 10. Deploy Vercel + ตั้ง env
- [ ] 11. สร้าง QR จาก URL จริง สำหรับพิมพ์

## Testing Checklist (ก่อนวันงาน)
- [ ] ส่งจาก iPhone (Safari) และ Android (Chrome) อย่างละครั้ง
- [ ] ถ่ายรูปจากกล้องโดยตรงแล้วส่งได้
- [ ] ปิด Wi-Fi ทดสอบผ่าน 4G
- [ ] ส่งแบบไม่มีรูป / 3 รูป / ข้อความยาว 500 ตัวอักษร
- [ ] ข้อความภาษาไทยยาวๆ ไม่ล้นการ์ด
- [ ] ตั้ง `is_hidden = true` ใน Dashboard แล้วข้อความหายจาก feed (ภายใน 30 วินาที)
- [ ] สแกน QR ที่พิมพ์ออกมาจริงแล้วเปิดเว็บได้

## After the Event
- Export ตาราง `wishes` เป็น CSV จาก Supabase Dashboard
- ดาวน์โหลดรูปทั้งหมดจาก bucket `wish-photos`
- รวมเป็นอัลบั้มมอบให้บ่าวสาว