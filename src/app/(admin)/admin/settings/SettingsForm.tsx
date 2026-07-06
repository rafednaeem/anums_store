"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { updateSettings } from "@/lib/admin/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/shared/ImageUploader"

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
        const message = err instanceof Error ? err.message : "Failed to save"
        toast.error(message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name</Label>
            <Input
              id="store_name"
              value={settings.store_name ?? ""}
              onChange={(e) => update("store_name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Store Logo</Label>
            <p className="text-xs text-neutral-500">
              Your main brand logo. Used in the header and email templates.
            </p>
            <div className="max-w-xs">
              <ImageUploader
                value={settings.store_logo ?? null}
                onChange={(url) => update("store_logo", url ?? "")}
                endpoint="/api/admin/upload/media"
                folder="branding"
                aspectRatio="landscape"
                label="Upload Logo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hero / Banner Image</Label>
            <p className="text-xs text-neutral-500">
              The main hero image shown on the homepage.
            </p>
            <div className="max-w-sm">
              <ImageUploader
                value={settings.hero_image ?? null}
                onChange={(url) => update("hero_image", url ?? "")}
                endpoint="/api/admin/upload/media"
                folder="branding"
                aspectRatio="landscape"
                label="Upload Hero"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement_banner">Announcement Bar Text</Label>
            <Input
              id="announcement_banner"
              value={settings.announcement_banner ?? ""}
              onChange={(e) => update("announcement_banner", e.target.value)}
              placeholder="e.g. Free shipping on orders over Rs. 10,000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store_email">Store Email</Label>
              <Input
                id="store_email"
                type="email"
                value={settings.store_email ?? ""}
                onChange={(e) => update("store_email", e.target.value)}
                placeholder="info@anumsstore.pk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_phone">Store Phone</Label>
              <Input
                id="store_phone"
                value={settings.store_phone ?? ""}
                onChange={(e) => update("store_phone", e.target.value)}
                placeholder="+923224183457"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                value={settings.whatsapp_number ?? ""}
                onChange={(e) => update("whatsapp_number", e.target.value)}
                placeholder="923224183457"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="store_address">Store Address</Label>
              <Input
                id="store_address"
                value={settings.store_address ?? ""}
                onChange={(e) => update("store_address", e.target.value)}
                placeholder="Lahore, Pakistan"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="social_facebook">Facebook</Label>
              <Input
                id="social_facebook"
                value={settings.social_facebook ?? ""}
                onChange={(e) => update("social_facebook", e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_instagram">Instagram</Label>
              <Input
                id="social_instagram"
                value={settings.social_instagram ?? ""}
                onChange={(e) => update("social_instagram", e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_tiktok">TikTok</Label>
              <Input
                id="social_tiktok"
                value={settings.social_tiktok ?? ""}
                onChange={(e) => update("social_tiktok", e.target.value)}
                placeholder="https://tiktok.com/@..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_youtube">YouTube</Label>
              <Input
                id="social_youtube"
                value={settings.social_youtube ?? ""}
                onChange={(e) => update("social_youtube", e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="free_shipping_threshold">
                Free Shipping Threshold (PKR)
              </Label>
              <Input
                id="free_shipping_threshold"
                type="number"
                min="0"
                value={settings.free_shipping_threshold ?? "10000"}
                onChange={(e) =>
                  update("free_shipping_threshold", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_shipping_rate">
                Default Shipping Rate (PKR)
              </Label>
              <Input
                id="default_shipping_rate"
                type="number"
                min="0"
                value={settings.default_shipping_rate ?? "500"}
                onChange={(e) =>
                  update("default_shipping_rate", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_rate_punjab">Punjab (PKR)</Label>
              <Input
                id="shipping_rate_punjab"
                type="number"
                min="0"
                value={settings.shipping_rate_punjab ?? "500"}
                onChange={(e) =>
                  update("shipping_rate_punjab", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_rate_sindh">Sindh (PKR)</Label>
              <Input
                id="shipping_rate_sindh"
                type="number"
                min="0"
                value={settings.shipping_rate_sindh ?? "600"}
                onChange={(e) =>
                  update("shipping_rate_sindh", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_rate_kpk">KPK (PKR)</Label>
              <Input
                id="shipping_rate_kpk"
                type="number"
                min="0"
                value={settings.shipping_rate_kpk ?? "700"}
                onChange={(e) => update("shipping_rate_kpk", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_rate_balochistan">
                Balochistan (PKR)
              </Label>
              <Input
                id="shipping_rate_balochistan"
                type="number"
                min="0"
                value={settings.shipping_rate_balochistan ?? "800"}
                onChange={(e) =>
                  update("shipping_rate_balochistan", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_rate_islamabad">Islamabad (PKR)</Label>
              <Input
                id="shipping_rate_islamabad"
                type="number"
                min="0"
                value={settings.shipping_rate_islamabad ?? "500"}
                onChange={(e) =>
                  update("shipping_rate_islamabad", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_rate_ajk">AJK (PKR)</Label>
              <Input
                id="shipping_rate_ajk"
                type="number"
                min="0"
                value={settings.shipping_rate_ajk ?? "700"}
                onChange={(e) => update("shipping_rate_ajk", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_rate_gb">Gilgit-Baltistan (PKR)</Label>
              <Input
                id="shipping_rate_gb"
                type="number"
                min="0"
                value={settings.shipping_rate_gb ?? "800"}
                onChange={(e) => update("shipping_rate_gb", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Transfer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-neutral-500">
            These details will be shown to customers at checkout so they can
            transfer payment to your account.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={settings.bank_name ?? ""}
                onChange={(e) => update("bank_name", e.target.value)}
                placeholder="HBL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account_title">Account Title</Label>
              <Input
                id="bank_account_title"
                value={settings.bank_account_title ?? ""}
                onChange={(e) => update("bank_account_title", e.target.value)}
                placeholder="Anums Store"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account">Account Number</Label>
              <Input
                id="bank_account"
                value={settings.bank_account ?? ""}
                onChange={(e) => update("bank_account", e.target.value)}
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_iban">IBAN</Label>
              <Input
                id="bank_iban"
                value={settings.bank_iban ?? ""}
                onChange={(e) => update("bank_iban", e.target.value)}
                placeholder="PK00HABB0000000000000000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage & SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero_title">Hero Title</Label>
            <Input
              id="hero_title"
              value={settings.hero_title ?? ""}
              onChange={(e) => update("hero_title", e.target.value)}
              placeholder="Curated Pakistani Fashion"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
            <Textarea
              id="hero_subtitle"
              rows={2}
              value={settings.hero_subtitle ?? ""}
              onChange={(e) => update("hero_subtitle", e.target.value)}
              placeholder="Discover collections that blend traditional artistry..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_title">SEO Title</Label>
            <Input
              id="seo_title"
              value={settings.seo_title ?? ""}
              onChange={(e) => update("seo_title", e.target.value)}
              placeholder="Anums Store | Handcrafted Elegance"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_description">SEO Description</Label>
            <Textarea
              id="seo_description"
              rows={3}
              value={settings.seo_description ?? ""}
              onChange={(e) => update("seo_description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer_text">Footer Text</Label>
            <Textarea
              id="footer_text"
              rows={3}
              value={settings.footer_text ?? ""}
              onChange={(e) => update("footer_text", e.target.value)}
              placeholder="Custom footer text..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
