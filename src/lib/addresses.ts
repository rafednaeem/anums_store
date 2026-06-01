import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export interface AddressInput {
  label: string;
  name: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface AddressRecord {
  id: string;
  user_id: string;
  label: string;
  name: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string | null;
  is_default: boolean;
  created_at: string;
}

export async function getUserAddresses(userId: string): Promise<AddressRecord[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getUserAddresses error:", error);
    return [];
  }

  return data;
}

export async function addAddress(
  userId: string,
  input: AddressInput
): Promise<AddressRecord | null> {
  if (!isSupabaseConfigured) return null;

  if (input.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      label: input.label || "Other",
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
      address: input.address,
      city: input.city,
      postal_code: input.postalCode || null,
      is_default: input.isDefault || false,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("addAddress error:", error);
    return null;
  }

  return data;
}

export async function updateAddress(
  id: string,
  userId: string,
  input: Partial<AddressInput>
): Promise<AddressRecord | null> {
  if (!isSupabaseConfigured) return null;

  if (input.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .neq("id", id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .update({
      ...(input.label !== undefined && { label: input.label }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.postalCode !== undefined && { postal_code: input.postalCode }),
      ...(input.isDefault !== undefined && { is_default: input.isDefault }),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) {
    console.error("updateAddress error:", error);
    return null;
  }

  return data;
}

export async function deleteAddress(
  id: string,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("deleteAddress error:", error);
    return false;
  }

  return true;
}

export async function setDefaultAddress(
  userId: string,
  id: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId);

  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("setDefaultAddress error:", error);
    return false;
  }

  return true;
}
