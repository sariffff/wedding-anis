"use server";

import { updateTag } from "next/cache";
import { PHOTO_BUCKET } from "@/lib/supabase";
import { getAdminSupabase } from "@/lib/supabase-admin";

const PUBLIC_PREFIX = `/storage/v1/object/public/${PHOTO_BUCKET}/`;

function storagePath(url: string) {
  const i = url.indexOf(PUBLIC_PREFIX);
  return i === -1 ? null : decodeURIComponent(url.slice(i + PUBLIC_PREFIX.length));
}

async function removePhotos(urls: string[]) {
  const paths = urls.map(storagePath).filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  const { error } = await getAdminSupabase().storage.from(PHOTO_BUCKET).remove(paths);
  if (error) console.error("Failed to remove photos", error);
}

export async function deleteWish(id: string) {
  const db = getAdminSupabase();
  const { data, error } = await db
    .from("wishes")
    .delete()
    .eq("id", id)
    .select("photo_urls")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (data) await removePhotos(data.photo_urls);
  updateTag("wishes");
}

export async function deletePhoto(id: string, url: string) {
  const db = getAdminSupabase();
  const { data: wish, error: readError } = await db
    .from("wishes")
    .select("photo_urls")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!wish) return;

  const { error } = await db
    .from("wishes")
    .update({ photo_urls: wish.photo_urls.filter((u: string) => u !== url) })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await removePhotos([url]);
  updateTag("wishes");
}
