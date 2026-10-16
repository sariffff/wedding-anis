// Download every photo from the wish-photos bucket.
// Usage: node --env-file=.env.local scripts/download-photos.mjs [outDir]
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const BUCKET = "wish-photos";
const outDir = process.argv[2] ?? "wish-photos-download";
const supabase = createClient(url, key);

// Photo URLs referenced by wishes (visible ones, via anon read policy).
const { data: wishes, error } = await supabase
  .from("wishes")
  .select("name, photo_urls, created_at")
  .order("created_at", { ascending: true });
if (error) throw error;

await mkdir(outDir, { recursive: true });

let count = 0;
for (const w of wishes) {
  for (const [i, photoUrl] of w.photo_urls.entries()) {
    const objectName = photoUrl.split(`/${BUCKET}/`)[1];
    const safeName = w.name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);
    const stamp = w.created_at.slice(0, 19).replace(/[:T]/g, "-");
    const file = path.join(outDir, `${stamp}_${safeName}_${i + 1}.jpg`);
    if (existsSync(file)) continue;

    const { data, error: dlErr } = await supabase.storage.from(BUCKET).download(objectName);
    if (dlErr) {
      console.warn("skip", objectName, dlErr.message);
      continue;
    }
    await writeFile(file, Buffer.from(await data.arrayBuffer()));
    count++;
    console.log("saved", file);
  }
}
console.log(`Done: ${count} new photos in ${outDir}`);
