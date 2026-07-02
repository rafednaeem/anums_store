"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AuthGuard from "@/components/shared/AuthGuard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PROVINCES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface Address {
  id: string
  label: string
  full_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  province: string
  postal_code: string | null
  is_default: boolean
}

export default function AddressesPage() {
  return (
    <AuthGuard>
      <AddressesContent />
    </AuthGuard>
  )
}

function AddressesContent() {
  const supabase = createClient()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    province: "",
    postal_code: "",
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  async function fetchAddresses() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })

    if (data) setAddresses(data)
    setLoading(false)
  }

  function resetForm() {
    setFormData({
      label: "Home",
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      province: "",
      postal_code: "",
    })
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(addr: Address) {
    setFormData({
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      province: addr.province,
      postal_code: addr.postal_code || "",
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      label: formData.label,
      full_name: formData.full_name,
      phone: formData.phone,
      address_line1: formData.address_line1,
      address_line2: formData.address_line2 || null,
      city: formData.city,
      province: formData.province,
      postal_code: formData.postal_code || null,
    }

    if (editingId) {
      await supabase.from("addresses").update(payload).eq("id", editingId)
    } else {
      const isFirst = addresses.length === 0
      await supabase
        .from("addresses")
        .insert({ ...payload, is_default: isFirst })
    }

    resetForm()
    await fetchAddresses()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from("addresses").delete().eq("id", id)
    await fetchAddresses()
  }

  async function handleSetDefault(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Unset all defaults
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)

    // Set new default
    await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)

    await fetchAddresses()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-ethereal-dark">
          Account
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ethereal-dark">Addresses</span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
          Addresses
        </h1>
        {!showForm && (
          <Button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="gap-2 bg-ethereal-dark text-white hover:bg-ethereal-dark/90"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="mt-6 rounded-lg border border-ethereal-silver/30 bg-white p-6"
        >
          <h2 className="font-heading text-lg font-bold text-ethereal-dark">
            {editingId ? "Edit Address" : "New Address"}
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="label">Label</Label>
              <select
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address_line1">Address Line 1 *</Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) =>
                  setFormData({ ...formData, address_line1: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) =>
                  setFormData({ ...formData, address_line2: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="province">Province *</Label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
                required
                className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select province</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="bg-ethereal-dark text-white hover:bg-ethereal-dark/90"
            >
              {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Address List */}
      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ethereal-maroon border-t-transparent" />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-ethereal-silver/50 bg-ethereal-cream/30 py-16 text-center">
          <MapPin className="mb-4 h-12 w-12 text-ethereal-silver" />
          <p className="font-heading text-lg font-semibold text-ethereal-dark">
            No addresses saved
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add an address for faster checkout.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "rounded-lg border bg-white p-6",
                addr.is_default
                  ? "border-ethereal-maroon"
                  : "border-ethereal-silver/30"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ethereal-dark">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="rounded-full bg-ethereal-cream px-2 py-0.5 text-xs text-ethereal-maroon">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {addr.full_name}
                    <br />
                    {addr.phone}
                    <br />
                    {addr.address_line1}
                    {addr.address_line2 && <>, {addr.address_line2}</>}
                    <br />
                    {addr.city}, {addr.province}
                    {addr.postal_code && ` ${addr.postal_code}`}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-ethereal-cream hover:text-ethereal-dark"
                  >
                    <Check className="h-3 w-3" />
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleEdit(addr)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-ethereal-cream hover:text-ethereal-dark"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
