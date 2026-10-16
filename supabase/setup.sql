-- Run this once in Supabase Dashboard → SQL Editor.
-- Project ref: alulsqyskhezrnxzoaed (used in the photo URL check below).

-- 1) Table -------------------------------------------------------------------
create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 50),
  relation text check (char_length(relation) <= 50),
  message text not null check (char_length(message) between 1 and 500),
  photo_urls text[] not null default '{}',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists wishes_created_at_idx on public.wishes (created_at desc);

alter table public.wishes enable row level security;

drop policy if exists "anon insert" on public.wishes;
create policy "anon insert" on public.wishes for insert to anon
  with check (
    is_hidden = false
    and coalesce(array_length(photo_urls, 1), 0) <= 3
    and not exists (
      select 1 from unnest(photo_urls) as u
      where u not like 'https://alulsqyskhezrnxzoaed.supabase.co/storage/v1/object/public/wish-photos/%'
    )
  );

drop policy if exists "anon read visible" on public.wishes;
create policy "anon read visible" on public.wishes for select to anon
  using (is_hidden = false);

-- 2) Storage bucket ----------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wish-photos', 'wish-photos', true, 2097152, array['image/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may upload into wish-photos; no update/delete policies => not allowed.
drop policy if exists "anon upload wish photos" on storage.objects;
create policy "anon upload wish photos" on storage.objects for insert to anon
  with check (bucket_id = 'wish-photos');
