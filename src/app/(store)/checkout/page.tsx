"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  MapPin,
  CreditCard,
  FileCheck,
  CheckCircle2,
  ChevronRight,
  Upload,
  Building2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { z } from "zod"
import { useCart } from "@/hooks/useCart"
import { createClient } from "@/lib/supabase/client"
import { shippingSchema } from "@/lib/validations"
import { PROVINCES } from "@/lib/constants"
import { formatPrice, calculateOrderTotals } from "@/lib/helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const PK_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Rawalpindi",
  "Multan",
  "Gujranwala",
  "Sialkot",
  "Sargodha",
  "Bahawalpur",
  "Dera Ghazi Khan",
  "Sahiwal",
  "Jhang",
  "Kasur",
  "Okara",
  "Sheikhupura",
  "Gujrat",
  "Mianwali",
  "Chiniot",
  "Hafizabad",
  "Khanewal",
  "Muzaffargarh",
  "Rajanpur",
  "Lodhran",
  "Vehari",
  "Pakpattan",
  "Nankana Sahib",
  "Attock",
  "Chakwal",
  "Jhelum",
  "Talagang",
  "Khushab",
  "Bhakkar",
  "Layyah",
  "Mandi Bahauddin",
  "Hyderabad",
  "Sukkur",
  "Larkana",
  "Nawabshah",
  "Mirpur Khas",
  "Jacobabad",
  "Dadu",
  "Thatta",
  "Badin",
  "Umerkot",
  "Tharparkar",
  "Jamshoro",
  "Matiari",
  "Tando Allahyar",
  "Tando Muhammad Khan",
  "Sanghar",
  "Naushahro Feroze",
  "Khairpur",
  "Ghotki",
  "Shikarpur",
  "Kamber Shahdadkot",
  "Peshawar",
  "Mardan",
  "Abbottabad",
  "Mingora",
  "Dera Ismail Khan",
  "Swabi",
  "Kohat",
  "Bannu",
  "Haripur",
  "Mansehra",
  "Nowshera",
  "Charsadda",
  "Quetta",
  "Turbat",
  "Gwadar",
  "Khuzdar",
  "Chaman",
  "Zhob",
  "Sibi",
  "Loralai",
  "Kharan",
  "Panjgur",
  "Lasbela",
  "Hub",
  "Gilgit",
  "Skardu",
  "Muzaffarabad",
  "Mirpur (AJK)",
  "Rawalakot",
]

const COD_ALLOWED_CITIES = ["Lahore", "Karachi", "Islamabad", "Faisalabad"]

const STEPS = [
  { id: 1, label: "Shipping", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Review", icon: FileCheck },
  { id: 4, label: "Confirm", icon: CheckCircle2 },
]

const checkoutFormSchema = shippingSchema.extend({
  payment_method: z.enum(["bank_transfer", "cod"]).optional(),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutFormSchema>

interface ShippingInfo {
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  province: string
  postal_code?: string
  guest_email?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cod">("bank_transfer")
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<Array<{ id: string; full_name: string; phone: string; address_line1: string; address_line2: string | null; city: string; province: string; postal_code: string | null }>>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    iban: "",
  })
  const [isUploadingProof, setIsUploadingProof] = useState(false)

  const supabase = createClient()

  const freeShippingThreshold = 10000
  const defaultShippingRate = 500

  const { subtotal, shipping, total } = calculateOrderTotals(
    items.map((i) => ({ price: i.price, quantity: i.quantity })),
    freeShippingThreshold,
    defaultShippingRate
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      province: "",
      postal_code: "",
      guest_email: "",
    },
  })

  const watchedCity = watch("city")

  useEffect(() => {
    async function loadAddresses() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })

      if (data) setSavedAddresses(data)
    }

    async function loadSettings() {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["bank_name", "bank_account_title", "bank_account", "bank_iban"])

      if (data) {
        const map = data.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, string>)
        setBankDetails({
          bankName: map.bank_name || "",
          accountTitle: map.bank_account_title || "",
          accountNumber: map.bank_account || "",
          iban: map.bank_iban || "",
        })
      }
    }

    loadAddresses()
    loadSettings()
  }, [supabase])

  useEffect(() => {
    if (items.length === 0 && step === 1) {
      router.push("/cart")
    }
  }, [items, step, router])

  function handleSelectAddress(addr: { id: string; full_name: string; phone: string; address_line1: string; address_line2: string | null; city: string; province: string; postal_code: string | null }) {
    setSelectedAddressId(addr.id)
    setValue("full_name", addr.full_name)
    setValue("phone", addr.phone)
    setValue("address_line1", addr.address_line1)
    setValue("address_line2", addr.address_line2 || "")
    setValue("city", addr.city)
    setValue("province", addr.province)
    setValue("postal_code", addr.postal_code || "")
  }

  async function handleProofUpload(file: File) {
    setIsUploadingProof(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload/payment-proof", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      setPaymentProofUrl(data.url)
      setPaymentProof(file)
      toast.success("Payment proof uploaded")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload proof"
      toast.error(message)
    } finally {
      setIsUploadingProof(false)
    }
  }

  function onSubmitStep1() {
    setStep(2)
  }

  function onSubmitStep2() {
    setStep(3)
  }

  async function onSubmit() {
    setIsSubmitting(true)
    try {
      const formData = watch()
      const idempotencyKey = crypto.randomUUID()

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping: {
            full_name: formData.full_name,
            phone: formData.phone,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2,
            city: formData.city,
            province: formData.province,
            postal_code: formData.postal_code,
            guest_email: formData.guest_email,
          },
          payment_method: paymentMethod,
          payment_proof_url: paymentProofUrl,
          notes: formData.notes,
          idempotency_key: idempotencyKey,
          items: items.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size,
            color: item.color,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create order")

      setOrderId(data.orderId)
      setOrderNumber(data.orderNumber)
      clearCart()
      setStep(4)
      toast.success("Order placed successfully!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to place order"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const codAvailable = useMemo(() => {
    return COD_ALLOWED_CITIES.includes(watchedCity)
  }, [watchedCity])

  if (items.length === 0 && step !== 4) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
        Checkout
      </h1>

      <div className="mt-8 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step >= s.id
                    ? "bg-ethereal-dark text-white"
                    : "bg-ethereal-silver/30 text-muted-foreground"
                }`}
              >
                {step > s.id ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  s.id
                )}
              </div>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  step >= s.id ? "text-ethereal-dark" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="mx-2 h-4 w-4 text-ethereal-silver sm:mx-4" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        {step === 1 && (
          <ShippingStep
            register={register}
            errors={errors}
            savedAddresses={savedAddresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={handleSelectAddress}
            onSubmit={handleSubmit(onSubmitStep1)}
          />
        )}

        {step === 2 && (
          <PaymentStep
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            codAvailable={codAvailable}
            watchedCity={watchedCity}
            bankDetails={bankDetails}
            onProofUpload={handleProofUpload}
            isUploadingProof={isUploadingProof}
            paymentProof={paymentProof}
            paymentProofUrl={paymentProofUrl}
            onSubmit={onSubmitStep2}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ReviewStep
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            shippingInfo={watch()}
            paymentMethod={paymentMethod}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <ConfirmationStep
            orderId={orderId!}
            orderNumber={orderNumber!}
            onContinueShopping={() => router.push("/shop")}
          />
        )}
      </div>
    </div>
  )
}

function ShippingStep({
  register,
  errors,
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onSubmit,
}: {
  register: ReturnType<typeof useForm<CheckoutFormData>>["register"]
  errors: ReturnType<typeof useForm<CheckoutFormData>>["formState"]["errors"]
  savedAddresses: Array<{ id: string; full_name: string; phone: string; address_line1: string; address_line2: string | null; city: string; province: string; postal_code: string | null }>
  selectedAddressId: string | null
  onSelectAddress: (addr: { id: string; full_name: string; phone: string; address_line1: string; address_line2: string | null; city: string; province: string; postal_code: string | null }) => void
  onSubmit: () => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-lg border border-ethereal-silver/30 bg-white p-6">
        <h2 className="font-heading text-xl font-bold text-ethereal-dark">
          Shipping Information
        </h2>

        {savedAddresses.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label>Saved Addresses</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelectAddress(addr)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    selectedAddressId === addr.id
                      ? "border-ethereal-dark bg-ethereal-cream"
                      : "border-ethereal-silver/30 hover:border-ethereal-dark/50"
                  }`}
                >
                  <p className="font-medium">{addr.full_name}</p>
                  <p className="text-muted-foreground">
                    {addr.address_line1}, {addr.city}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="Enter your full name"
              className="mt-1"
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="03XXXXXXXXX"
              className="mt-1"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="guest_email">Email (optional for guests)</Label>
            <Input
              id="guest_email"
              {...register("guest_email")}
              placeholder="your@email.com"
              className="mt-1"
            />
            {errors.guest_email && (
              <p className="mt-1 text-xs text-red-500">{errors.guest_email.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="address_line1">Address Line 1 *</Label>
            <Input
              id="address_line1"
              {...register("address_line1")}
              placeholder="House number, street name"
              className="mt-1"
            />
            {errors.address_line1 && (
              <p className="mt-1 text-xs text-red-500">{errors.address_line1.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="address_line2">Address Line 2 (optional)</Label>
            <Input
              id="address_line2"
              {...register("address_line2")}
              placeholder="Apartment, suite, floor"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <select
              id="city"
              {...register("city")}
              className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select city</option>
              {PK_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="province">Province *</Label>
            <select
              id="province"
              {...register("province")}
              className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select province</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="mt-1 text-xs text-red-500">{errors.province.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="postal_code">Postal Code (optional)</Label>
            <Input
              id="postal_code"
              {...register("postal_code")}
              placeholder="e.g. 54000"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" className="bg-ethereal-dark text-white hover:bg-ethereal-dark/90">
          Continue to Payment
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

function PaymentStep({
  paymentMethod,
  setPaymentMethod,
  codAvailable,
  watchedCity,
  bankDetails,
  onProofUpload,
  isUploadingProof,
  paymentProof,
  paymentProofUrl,
  onSubmit,
  onBack,
}: {
  paymentMethod: "bank_transfer" | "cod"
  setPaymentMethod: (m: "bank_transfer" | "cod") => void
  codAvailable: boolean
  watchedCity: string
  bankDetails: { bankName: string; accountTitle: string; accountNumber: string; iban: string }
  onProofUpload: (file: File) => void
  isUploadingProof: boolean
  paymentProof: File | null
  paymentProofUrl: string | null
  onSubmit: () => void
  onBack: () => void
}) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onProofUpload(file)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-ethereal-silver/30 bg-white p-6">
        <h2 className="font-heading text-xl font-bold text-ethereal-dark">
          Payment Method
        </h2>

        <div className="mt-4 space-y-3">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              paymentMethod === "bank_transfer"
                ? "border-ethereal-dark bg-ethereal-cream"
                : "border-ethereal-silver/30 hover:border-ethereal-dark/50"
            }`}
          >
            <input
              type="radio"
              name="payment_method"
              value="bank_transfer"
              checked={paymentMethod === "bank_transfer"}
              onChange={() => setPaymentMethod("bank_transfer")}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-ethereal-dark">Bank Transfer</p>
              <p className="text-sm text-muted-foreground">
                Transfer the order amount to our bank account and upload proof of payment.
              </p>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              !codAvailable
                ? "cursor-not-allowed border-ethereal-silver/30 opacity-50"
                : paymentMethod === "cod"
                ? "border-ethereal-dark bg-ethereal-cream"
                : "border-ethereal-silver/30 hover:border-ethereal-dark/50"
            }`}
          >
            <input
              type="radio"
              name="payment_method"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => codAvailable && setPaymentMethod("cod")}
              disabled={!codAvailable}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-ethereal-dark">Cash on Delivery</p>
                {!codAvailable && (
                  <span className="rounded-full bg-ethereal-silver/30 px-2 py-0.5 text-xs text-muted-foreground">
                    Unavailable
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Pay when you receive your order. Available in Lahore, Karachi, Islamabad &amp; Faisalabad only.
              </p>
              {!codAvailable && watchedCity && (
                <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  COD is not available in {watchedCity}. Please choose a different city or use bank transfer.
                </p>
              )}
            </div>
          </label>
        </div>

        {paymentMethod === "bank_transfer" && (
          <div className="mt-6 rounded-lg border border-ethereal-silver/30 bg-ethereal-cream/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ethereal-dark">
              <Building2 className="h-4 w-4" />
              Bank Transfer Details
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Bank:</span> {bankDetails.bankName || "Meezan Bank"}</p>
              <p><span className="text-muted-foreground">Account Title:</span> {bankDetails.accountTitle || "Anums Store"}</p>
              <p><span className="text-muted-foreground">Account Number:</span> {bankDetails.accountNumber || "Contact us for details"}</p>
              <p><span className="text-muted-foreground">IBAN:</span> {bankDetails.iban || "Contact us for details"}</p>
            </div>

            <div className="mt-4">
              <Label>Upload Payment Proof</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Accepted formats: JPG, PNG, WEBP (max 5MB)
              </p>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-ethereal-silver/50 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-ethereal-dark/50 hover:text-ethereal-dark">
                  <Upload className="h-4 w-4" />
                  {isUploadingProof ? "Uploading..." : "Choose file"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={isUploadingProof}
                    className="hidden"
                  />
                </label>
                {paymentProof && !isUploadingProof && (
                  <span className="text-sm text-green-600">
                    {paymentProof.name} uploaded
                  </span>
                )}
              </div>
              {paymentProofUrl && (
                <p className="mt-2 text-xs text-green-600">Proof uploaded successfully</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onSubmit}
          size="lg"
          className="bg-ethereal-dark text-white hover:bg-ethereal-dark/90"
          disabled={paymentMethod === "bank_transfer" && !paymentProofUrl && !paymentProof}
        >
          Review Order
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ReviewStep({
  items,
  subtotal,
  shipping,
  total,
  shippingInfo,
  paymentMethod,
  isSubmitting,
  onSubmit,
  onBack,
}: {
  items: Array<{ id: string; name: string; price: number; quantity: number; size?: string; color?: string }>
  subtotal: number
  shipping: number
  total: number
  shippingInfo: ShippingInfo
  paymentMethod: string
  isSubmitting: boolean
  onSubmit: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-ethereal-silver/30 bg-white p-6">
        <h2 className="font-heading text-xl font-bold text-ethereal-dark">
          Review Your Order
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ethereal-dark">Items</h3>
            <div className="mt-2 divide-y divide-ethereal-silver/20">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    {item.size && <span className="text-muted-foreground"> - {item.size}</span>}
                    {item.color && <span className="text-muted-foreground"> - {item.color}</span>}
                    <span className="text-muted-foreground"> x{item.quantity}</span>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-ethereal-silver/30 pt-4">
            <h3 className="text-sm font-semibold text-ethereal-dark">Shipping To</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {shippingInfo.full_name}<br />
              {shippingInfo.address_line1}<br />
              {shippingInfo.address_line2 && <>{shippingInfo.address_line2}<br /></>}
              {shippingInfo.city}, {shippingInfo.province}
              {shippingInfo.postal_code && <> {shippingInfo.postal_code}</>}
            </p>
          </div>

          <div className="border-t border-ethereal-silver/30 pt-4">
            <h3 className="text-sm font-semibold text-ethereal-dark">Payment Method</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-ethereal-silver/30 bg-white p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="border-t border-ethereal-silver/30 pt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-ethereal-dark">Total</span>
              <span className="font-heading text-xl font-bold text-ethereal-dark">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={onSubmit}
          size="lg"
          className="bg-ethereal-dark text-white hover:bg-ethereal-dark/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </div>
  )
}

function ConfirmationStep({
  orderId,
  orderNumber,
  onContinueShopping,
}: {
  orderId: string
  orderNumber: string
  onContinueShopping: () => void
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-ethereal-silver/30 bg-white py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="mt-6 font-heading text-2xl font-bold text-ethereal-dark">
        Order Placed Successfully!
      </h2>
      <p className="mt-2 text-muted-foreground">
        Thank you for your order. We&apos;ll process it shortly.
      </p>
      <p className="mt-4 text-sm">
        <span className="text-muted-foreground">Order Number: </span>
        <span className="font-semibold text-ethereal-dark">{orderNumber}</span>
      </p>

      <div className="mt-8 flex gap-4">
        <Button
          onClick={() => window.location.href = `/order-confirmation?id=${orderId}`}
          variant="outline"
        >
          View Order Details
        </Button>
        <Button
          onClick={onContinueShopping}
          className="bg-ethereal-dark text-white hover:bg-ethereal-dark/90"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
