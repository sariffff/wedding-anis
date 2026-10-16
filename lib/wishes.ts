import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "./supabase";
import type { Wish } from "./types";

export async function getLatestWishes(): Promise<Wish[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 30, expire: 3600 });
  cacheTag("wishes");

  const { data, error } = await supabase
    .from("wishes")
    .select("id, name, relation, message, photo_urls, created_at")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to load wishes", error);
    return [];
  }
  return data ?? [];
}
