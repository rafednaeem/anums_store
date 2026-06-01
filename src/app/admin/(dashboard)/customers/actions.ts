"use server";

import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = ["new", "read", "replied"];

export async function updateInquiryStatus(inquiryId: string, status: string) {
  if (!isAdminConfigured) {
    return { error: "Admin database client not configured" };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  const { error } = await supabaseAdmin
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/customers");
  return { success: true };
}
