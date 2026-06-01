"use client";

import { supabase } from "@/lib/supabaseClient";
import {
  Heart, MapPin, Package, UserRound, ChevronRight,
  Clock, Truck, CheckCircle2, XCircle,
  Plus, Pencil, Trash2, Star,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getUserOrders, OrderRecord } from "@/lib/orders";
import {
  getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
  AddressRecord, AddressInput,
} from "@/lib/addresses";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";

const statusBadge: Record<string, { label: string; class: string; icon: typeof Package }> = {
  new: { label: "New", class: "bg-blue-100 text-blue-700", icon: Clock },
  confirmed: { label: "Confirmed", class: "bg-ethereal-mint/20 text-foreground", icon: CheckCircle2 },
  shipped: { label: "Shipped", class: "bg-ethereal-dark/20 text-ethereal-dark", icon: Truck },
  delivered: { label: "Delivered", class: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-700", icon: XCircle },
};

type AddressFormMode = "add" | "edit";

const emptyForm: AddressInput = {
  label: "Home",
  name: "",
  lastName: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  isDefault: false,
};

function AddressForm({
  initial,
  onSubmit,
  onCancel,
  saving,
}: {
  initial: AddressInput;
  onSubmit: (data: AddressInput) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<AddressInput>(initial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.lastName || !form.phone || !form.address || !form.city) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-gray-100 pt-4">
      <div className="flex gap-2">
        <select
          name="label"
          value={form.label}
          onChange={handleChange}
          className="w-28 border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
        >
          <option value="Home">Home</option>
          <option value="Work">Work</option>
          <option value="Other">Other</option>
        </select>
        <input
          name="name"
          placeholder="First name *"
          value={form.name}
          onChange={handleChange}
          className="flex-1 border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
        />
        <input
          name="lastName"
          placeholder="Last name *"
          value={form.lastName}
          onChange={handleChange}
          className="flex-1 border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
        />
      </div>
      <input
        name="phone"
        placeholder="Phone number *"
        value={form.phone}
        onChange={handleChange}
        className="w-full border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
      />
      <input
        name="address"
        placeholder="Address *"
        value={form.address}
        onChange={handleChange}
        className="w-full border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
      />
      <div className="flex gap-2">
        <input
          name="city"
          placeholder="City *"
          value={form.city}
          onChange={handleChange}
          className="flex-1 border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
        />
        <input
          name="postalCode"
          placeholder="Postal code"
          value={form.postalCode}
          onChange={handleChange}
          className="w-28 border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isDefault"
          checked={form.isDefault}
          onChange={handleChange}
          className="accent-ethereal-silver"
        />
        Set as default address
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1 bg-ethereal-maroon px-4 py-2 text-sm font-bold uppercase tracking-widest text-ethereal-silver transition-colors hover:bg-ethereal-maroon hover:text-white disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="border-2 border-gray-300 px-4 py-2 text-sm font-bold uppercase tracking-widest text-gray-600 transition-colors hover:border-gray-400 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProfileCard({
  email,
  name,
  phone,
  onSave,
}: {
  email: string;
  name: string;
  phone: string;
  onSave: (data: { name: string; phone: string }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState(name);
  const [formPhone, setFormPhone] = useState(phone);

  useEffect(() => {
    setFormName(name);
    setFormPhone(phone);
  }, [name, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ name: formName, phone: formPhone });
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-heading text-foreground">
        <UserRound className="h-6 w-6 text-ethereal-maroon" />
        Profile
      </h2>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Name</label>
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Phone</label>
            <input
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
              placeholder="03XX-XXXXXXX"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1 bg-ethereal-maroon px-4 py-2 text-sm font-bold uppercase tracking-widest text-ethereal-silver transition-colors hover:bg-ethereal-maroon hover:text-white disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border-2 border-gray-300 px-4 py-2 text-sm font-bold uppercase tracking-widest text-gray-600 transition-colors hover:border-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2 text-sm">
          <p><span className="font-bold text-foreground">Email:</span> {email}</p>
          <p><span className="font-bold text-foreground">Name:</span> {name || "—"}</p>
          <p><span className="font-bold text-foreground">Phone:</span> {phone || "—"}</p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-sm font-bold text-foreground transition-colors hover:text-ethereal-maroon"
            >
              <Pencil className="h-4 w-4" /> Edit Profile
            </button>
            <Link
              href="/reset-password"
              className="flex items-center gap-1 text-sm font-bold text-gray-500 transition-colors hover:text-foreground"
            >
              Change Password
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function WishlistCard() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);

  return (
    <div className="border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-heading text-foreground">
        <Heart className="h-6 w-6 text-ethereal-maroon" />
        Wishlist
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-foreground/65">
          Your wishlist is empty.{" "}
          <Link href="/ready-to-wear" className="font-bold text-ethereal-maroon underline">
            Browse products
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border border-gray-100 p-3"
            >
              <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden bg-gray-100">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.id}`}
                  className="text-sm font-bold text-foreground transition-colors hover:text-ethereal-maroon"
                >
                  {item.name}
                </Link>
                <p className="text-sm font-bold text-ethereal-maroon">
                  Rs. {item.price.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    addToCart({ ...item, quantity: 1, size: "Default" });
                    toast.success("Added to cart");
                  }}
                  className="bg-ethereal-maroon px-3 py-2 text-xs font-bold uppercase tracking-widest text-ethereal-silver transition-colors hover:bg-ethereal-maroon hover:text-white"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    removeItem(item.id);
                    toast("Removed from wishlist");
                  }}
                  className="flex items-center justify-center px-2 text-gray-400 transition-colors hover:text-red-500"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountClient() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressFormMode, setAddressFormMode] = useState<AddressFormMode | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      setUserName(user?.user_metadata?.name ?? "");
      setUserPhone(user?.user_metadata?.phone ?? "");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    setOrdersLoading(true);
    getUserOrders(userId).then((data) => {
      setOrders(data);
      setOrdersLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setAddressesLoading(true);
    getUserAddresses(userId).then((data) => {
      setAddresses(data);
      setAddressesLoading(false);
    });
  }, [userId]);

  const refreshAddresses = () => {
    if (!userId) return;
    getUserAddresses(userId).then(setAddresses);
  };

  const handleAddAddress = async (data: AddressInput) => {
    if (!userId) return;
    setSaving(true);
    const result = await addAddress(userId, data);
    setSaving(false);
    if (result) {
      toast.success("Address added.");
      setAddressFormMode(null);
      refreshAddresses();
    } else {
      toast.error("Failed to add address.");
    }
  };

  const handleUpdateAddress = async (data: AddressInput) => {
    if (!userId || !editingId) return;
    setSaving(true);
    const result = await updateAddress(editingId, userId, data);
    setSaving(false);
    if (result) {
      toast.success("Address updated.");
      setEditingId(null);
      setAddressFormMode(null);
      refreshAddresses();
    } else {
      toast.error("Failed to update address.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!userId) return;
    if (!confirm("Delete this address?")) return;
    const ok = await deleteAddress(id, userId);
    if (ok) {
      toast.success("Address deleted.");
      refreshAddresses();
    } else {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!userId) return;
    const ok = await setDefaultAddress(userId, id);
    if (ok) {
      refreshAddresses();
    } else {
      toast.error("Failed to set default address.");
    }
  };

  const startEdit = (addr: AddressRecord) => {
    setAddressFormMode("edit");
    setEditingId(addr.id);
  };

  const handleProfileSave = async ({ name, phone }: { name: string; phone: string }) => {
    const { error } = await supabase.auth.updateUser({ data: { name, phone } });
    if (error) {
      toast.error(error.message);
      return;
    }
    setUserName(name);
    setUserPhone(phone);
    toast.success("Profile updated.");
  };

  const cancelForm = () => {
    setAddressFormMode(null);
    setEditingId(null);
  };

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading your account...</div>;
  }

  if (!email) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <UserRound className="mx-auto mb-4 h-12 w-12 text-ethereal-maroon" />
        <h1 className="mb-3 text-4xl font-heading text-foreground">Your Account</h1>
        <p className="mb-8 text-foreground/65">Sign in to manage profile details, saved addresses, wishlist, and future order history.</p>
        <div className="flex justify-center gap-3">
          <Link href="/login" className="bg-ethereal-maroon px-6 py-3 font-bold uppercase tracking-widest text-ethereal-silver">Login</Link>
          <Link href="/register" className="border-2 border-ethereal-silver px-6 py-3 font-bold uppercase tracking-widest text-foreground">Register</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-heading text-foreground">My Account</h1>
          <p className="mt-2 text-foreground/65">{email}</p>
        </div>
        <button onClick={handleLogout} className="bg-ethereal-maroon px-5 py-3 text-sm font-bold uppercase tracking-widest text-ethereal-silver hover:bg-ethereal-maroon hover:text-white">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-heading text-foreground">
              <Package className="h-6 w-6 text-ethereal-maroon" />
              Order History
            </h2>

            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-sm text-foreground/65">
                No orders yet.{" "}
                <Link href="/ready-to-wear" className="font-bold text-ethereal-maroon underline">
                  Start shopping
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const badge = statusBadge[order.status] || statusBadge.new;
                  const BadgeIcon = badge.icon;
                  return (
                    <Link
                      key={order.id}
                      href={`/order-confirmation?id=${order.id}`}
                      className="flex items-center justify-between gap-4 border border-gray-100 p-4 transition-colors hover:border-ethereal-maroon/30 hover:bg-ethereal-maroon/5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-foreground">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.class}`}>
                            <BadgeIcon className="h-3 w-3" />
                            {badge.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-foreground/65">
                          {new Date(order.created_at).toLocaleDateString("en-PK", {
                            year: "numeric", month: "long", day: "numeric",
                          })}
                          {" — "}
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          {" — "}
                          <span className="font-bold text-ethereal-maroon">Rs. {order.total.toLocaleString()}</span>
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {email && (
            <ProfileCard
              email={email}
              name={userName}
              phone={userPhone}
              onSave={handleProfileSave}
            />
          )}

          <div className="border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-heading text-foreground">
                <MapPin className="h-6 w-6 text-ethereal-maroon" />
                Saved Addresses
              </h2>
              {addressFormMode === null && (
                <button
                  onClick={() => setAddressFormMode("add")}
                  className="flex items-center gap-1 text-sm font-bold text-ethereal-maroon transition-colors hover:text-foreground"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              )}
            </div>

            {addressesLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : addressFormMode === "add" ? (
              <AddressForm
                initial={emptyForm}
                onSubmit={handleAddAddress}
                onCancel={cancelForm}
                saving={saving}
              />
            ) : addresses.length === 0 ? (
              <p className="text-sm text-foreground/65">
                No saved addresses. Add one for faster checkout.
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isEditing = editingId === addr.id && addressFormMode === "edit";
                  return (
                    <div
                      key={addr.id}
                      className={`relative border p-3 text-sm transition-colors ${addr.is_default
                          ? "border-ethereal-maroon/40 bg-ethereal-maroon/5"
                          : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                    >
                      {isEditing ? (
                        <AddressForm
                          initial={{
                            label: addr.label,
                            name: addr.name,
                            lastName: addr.lastName,
                            phone: addr.phone,
                            address: addr.address,
                            city: addr.city,
                            postalCode: addr.postal_code ?? "",
                            isDefault: addr.is_default,
                          }}
                          onSubmit={handleUpdateAddress}
                          onCancel={cancelForm}
                          saving={saving}
                        />
                      ) : (
                        <>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                              {addr.label}
                            </span>
                            {addr.is_default && (
                              <span className="flex items-center gap-1 text-xs font-bold text-ethereal-maroon">
                                <Star className="h-3 w-3 fill-ethereal-maroon" /> Default
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-foreground">
                            {addr.name} {addr.lastName}
                          </p>
                          <p className="text-foreground/65">{addr.address}</p>
                          <p className="text-foreground/65">
                            {addr.city}
                            {addr.postal_code ? `, ${addr.postal_code}` : ""}
                          </p>
                          <p className="text-foreground/65">{addr.phone}</p>

                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => startEdit(addr)}
                              className="flex items-center gap-1 text-xs font-bold text-foreground transition-colors hover:text-ethereal-maroon"
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                            {!addr.is_default && (
                              <button
                                onClick={() => handleSetDefault(addr.id)}
                                className="flex items-center gap-1 text-xs font-bold text-gray-500 transition-colors hover:text-foreground"
                              >
                                <Star className="h-3 w-3" /> Set default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="flex items-center gap-1 text-xs font-bold text-red-500 transition-colors hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <WishlistCard />
        </div>
      </div>
    </div>
  );
}
