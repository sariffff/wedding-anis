"use server";

import { updateTag } from "next/cache";

// Called after a successful insert so the sender sees their wish on the feed right away.
export async function refreshWishes() {
  updateTag("wishes");
}
