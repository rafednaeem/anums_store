"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateSettings } from "@/lib/admin/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SettingsFormProps {
  initialSettings: Record<string, string>
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [settings, setSettings] = useState(initialSettings)

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        await updateSettings(settings)
        toast.success("Settings saved")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save")
      }
    })
  }

  const fields = [
    { key: "store_name", label: "Store Name", placeholder: "Anums Store" },
    { key: "store_email", label: "Store Email", placeholder: "info@anumsstore.pk", type: "email" },
    { key: "store_phone", label: "Store Phone", placeholder: "+923224183457" },
    { key: "whatsapp_number", label: "WhatsApp Number", placeholder: "923224183457" },
    { key: "store_address", label: "Store Address", placeholder: "Lahore, Pakistan" },
  ]

  const shippingFields = [
    { key: "free_shipping_threshold", label: "Free Shipping Threshold (PKR)", placeholder: "10000", type: "number" },
    { key: "default_shipping_rate", label: "Default Shipping Rate (PKR)", placeholder: "500", type: "number" },
  ]

  const bankFields = [
    { key: "bank_name", label: "Bank Name", placeholder: "HBL" },
    { key: "bank_account_title", label: "Account Title", placeholder: "Anums Store" },
    { key: "bank_account", label: "Account Number", placeholder: "1234567890" },
    { key: "bank_iban", label: "IBAN", placeholder: "PK00HABB0000000000000000" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                value={settings[field.key] ?? ""}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                type={field.type ?? "text"}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shippingFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                value={settings[field.key] ?? ""}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                type={field.type ?? "text"}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                value={settings[field.key] ?? ""}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer / Additional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer_text">Footer Text</Label>
            <Textarea
              id="footer_text"
              value={settings.footer_text ?? ""}
              onChange={(e) => update("footer_text", e.target.value)}
              placeholder="Custom footer text..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcement_banner">Announcement Banner</Label>
            <Input
              id="announcement_banner"
              value={settings.announcement_banner ?? ""}
              onChange={(e) => update("announcement_banner", e.target.value)}
              placeholder="e.g. Free shipping on orders over Rs. 10,000"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
