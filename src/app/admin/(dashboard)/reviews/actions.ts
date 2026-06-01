"use server";

import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = ["pending", "approved", "rejected"];

export async function updateReviewStatus(reviewId: string, status: string) {
  if (!isAdminConfigured) {
    return { error: "Admin database client not configured" };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  const { error } = await supabaseAdmin
    .from("reviews")
    .update({ status })
    .eq("id", reviewId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/reviews");
  return { success: true };
}
