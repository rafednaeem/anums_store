"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/shared/ImageUploader"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { savePageContents } from "@/lib/admin/actions"
import { Loader2, ChevronDown, ChevronRight } from "lucide-react"

type FieldConfig = {
  key: string
  label: string
  type: "text" | "textarea" | "image"
  help?: string
}

type SectionConfig = {
  key: string
  title: string
  fields: FieldConfig[]
}

type PageConfig = {
  label: string
  sections: SectionConfig[]
}

const PAGE_CONFIGS: Record<string, PageConfig> = {
  home: {
    label: "Home",
    sections: [
      {
        key: "hero",
        title: "Hero Section",
        fields: [
          { key: "eyebrow", label: "Eyebrow Text", type: "text" },
          { key: "title", label: "Heading", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "cta_text", label: "Button Text", type: "text" },
          { key: "cta_link", label: "Button Link", type: "text" },
        ],
      },
      {
        key: "marquee",
        title: "Marquee Banner",
        fields: [
          {
            key: "items",
            label: "Items (separate with |||)",
            type: "textarea",
            help: "Separate each marquee item with |||",
          },
        ],
      },
      {
        key: "featured_products",
        title: "Featured Products",
        fields: [
          { key: "title", label: "Section Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "empty_message", label: "Empty State Message", type: "text" },
        ],
      },
      {
        key: "categories",
        title: "Categories Header",
        fields: [
          { key: "section_label", label: "Section Label", type: "text" },
          { key: "title", label: "Section Title", type: "text" },
        ],
      },
      {
        key: "category_1",
        title: "Category: Ready-to-Wear",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "text" },
          { key: "cta_text", label: "CTA Text", type: "text" },
          { key: "image_url", label: "Image", type: "image" },
          { key: "image_alt", label: "Image Alt Text", type: "text" },
          { key: "link", label: "Link URL", type: "text" },
        ],
      },
      {
        key: "category_2",
        title: "Category: Bridal",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "cta_text", label: "CTA Text", type: "text" },
          { key: "image_url", label: "Image", type: "image" },
          { key: "image_alt", label: "Image Alt Text", type: "text" },
          { key: "link", label: "Link URL", type: "text" },
        ],
      },
      {
        key: "category_3",
        title: "Category: Accessories",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "cta_text", label: "CTA Text", type: "text" },
          { key: "image_url", label: "Image", type: "image" },
          { key: "image_alt", label: "Image Alt Text", type: "text" },
          { key: "link", label: "Link URL", type: "text" },
        ],
      },
      {
        key: "brand_ethos",
        title: "Brand Ethos",
        fields: [
          { key: "quote", label: "Quote Heading", type: "textarea" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "cta_text", label: "Button Text", type: "text" },
          { key: "cta_link", label: "Button Link", type: "text" },
        ],
      },
    ],
  },
  header: {
    label: "Header",
    sections: [
      {
        key: "nav",
        title: "Navigation Links",
        fields: [
          { key: "link_1_label", label: "Link 1 Label", type: "text" },
          { key: "link_1_href", label: "Link 1 URL", type: "text" },
          { key: "link_2_label", label: "Link 2 Label", type: "text" },
          { key: "link_2_href", label: "Link 2 URL", type: "text" },
          { key: "link_3_label", label: "Link 3 Label", type: "text" },
          { key: "link_3_href", label: "Link 3 URL", type: "text" },
        ],
      },
    ],
  },
  footer: {
    label: "Footer",
    sections: [
      {
        key: "brand",
        title: "Brand",
        fields: [
          { key: "description", label: "Tagline", type: "textarea" },
          { key: "logo_url", label: "Logo", type: "image" },
        ],
      },
      {
        key: "quick_links",
        title: "Quick Links",
        fields: [
          { key: "heading", label: "Section Heading", type: "text" },
          { key: "link_1_label", label: "Link 1 Label", type: "text" },
          { key: "link_1_href", label: "Link 1 URL", type: "text" },
          { key: "link_2_label", label: "Link 2 Label", type: "text" },
          { key: "link_2_href", label: "Link 2 URL", type: "text" },
          { key: "link_3_label", label: "Link 3 Label", type: "text" },
          { key: "link_3_href", label: "Link 3 URL", type: "text" },
        ],
      },
      {
        key: "assistance",
        title: "Assistance Links",
        fields: [
          { key: "heading", label: "Section Heading", type: "text" },
          { key: "link_1_label", label: "Link 1 Label", type: "text" },
          { key: "link_1_href", label: "Link 1 URL", type: "text" },
          { key: "link_2_label", label: "Link 2 Label", type: "text" },
          { key: "link_2_href", label: "Link 2 URL", type: "text" },
        ],
      },
      {
        key: "bottom",
        title: "Bottom Bar",
        fields: [
          {
            key: "copyright",
            label: "Copyright Text",
            type: "text",
            help: "Store name and year are added automatically",
          },
          { key: "location_1", label: "Location 1", type: "text" },
          { key: "location_2", label: "Location 2", type: "text" },
          { key: "location_3", label: "Location 3", type: "text" },
        ],
      },
    ],
  },
  bridal: {
    label: "Bridal",
    sections: [
      {
        key: "hero",
        title: "Hero Section",
        fields: [
          { key: "background_image", label: "Background Image", type: "image" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "cta_text", label: "Button Text", type: "text" },
        ],
      },
      {
        key: "stats",
        title: "Hero Stats",
        fields: [
          { key: "stat_1", label: "Stat 1", type: "text" },
          { key: "stat_2", label: "Stat 2", type: "text" },
        ],
      },
      {
        key: "philosophy",
        title: "Philosophy Section",
        fields: [
          { key: "label", label: "Section Label", type: "text" },
          { key: "title", label: "Heading", type: "textarea" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      {
        key: "masterpiece",
        title: "Featured Masterpiece",
        fields: [
          { key: "image_url", label: "Image", type: "image" },
          { key: "image_alt", label: "Image Alt", type: "text" },
          { key: "label", label: "Label", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      {
        key: "bento_grid",
        title: "Bento Grid",
        fields: [
          { key: "title", label: "Section Title", type: "text" },
          { key: "subtitle", label: "Section Subtitle", type: "text" },
          { key: "item_1_image", label: "Item 1 Image", type: "image" },
          { key: "item_1_alt", label: "Item 1 Alt", type: "text" },
          { key: "item_1_label", label: "Item 1 Label", type: "text" },
          { key: "item_2_image", label: "Item 2 Image", type: "image" },
          { key: "item_2_alt", label: "Item 2 Alt", type: "text" },
          { key: "item_2_label", label: "Item 2 Label", type: "text" },
          { key: "item_3_image", label: "Item 3 Image", type: "image" },
          { key: "item_3_alt", label: "Item 3 Alt", type: "text" },
          { key: "item_3_label", label: "Item 3 Label", type: "text" },
          { key: "item_4_image", label: "Item 4 Image", type: "image" },
          { key: "item_4_alt", label: "Item 4 Alt", type: "text" },
          { key: "item_4_label", label: "Item 4 Label", type: "text" },
        ],
      },
      {
        key: "consultation",
        title: "Consultation CTA",
        fields: [
          { key: "background_image", label: "Background Image", type: "image" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "form_name_label", label: "Name Label", type: "text" },
          { key: "form_name_placeholder", label: "Name Placeholder", type: "text" },
          { key: "form_email_label", label: "Email Label", type: "text" },
          {
            key: "form_email_placeholder",
            label: "Email Placeholder",
            type: "text",
          },
          { key: "submit_text", label: "Submit Button Text", type: "text" },
        ],
      },
    ],
  },
  "our-story": {
    label: "Our Story",
    sections: [
      {
        key: "hero",
        title: "Hero Section",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "subtext", label: "Subtext", type: "text" },
          { key: "image_url", label: "Hero Image", type: "image" },
          { key: "image_alt", label: "Image Alt Text", type: "text" },
          { key: "image_overlay", label: "Image Overlay Text", type: "text" },
        ],
      },
      {
        key: "artisans",
        title: "Artisans Section",
        fields: [
          { key: "image_url", label: "Image", type: "image" },
          { key: "image_alt", label: "Image Alt", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "paragraph_1", label: "Paragraph 1", type: "textarea" },
          { key: "paragraph_2", label: "Paragraph 2", type: "textarea" },
        ],
      },
      {
        key: "quote",
        title: "Quote Section",
        fields: [
          { key: "text", label: "Quote Text", type: "textarea" },
          { key: "attribution", label: "Attribution", type: "text" },
        ],
      },
      {
        key: "values",
        title: "Value Propositions",
        fields: [
          { key: "value_1_title", label: "Value 1 Title", type: "text" },
          {
            key: "value_1_description",
            label: "Value 1 Description",
            type: "textarea",
          },
          { key: "value_2_title", label: "Value 2 Title", type: "text" },
          {
            key: "value_2_description",
            label: "Value 2 Description",
            type: "textarea",
          },
          { key: "value_3_title", label: "Value 3 Title", type: "text" },
          {
            key: "value_3_description",
            label: "Value 3 Description",
            type: "textarea",
          },
        ],
      },
    ],
  },
  shop: {
    label: "Shop",
    sections: [
      {
        key: "hero",
        title: "Page Header",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      {
        key: "empty_state",
        title: "Empty State",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "text" },
        ],
      },
    ],
  },
  contact: {
    label: "Contact",
    sections: [
      {
        key: "hero",
        title: "Hero Section",
        fields: [
          { key: "image_url", label: "Background Image", type: "image" },
          { key: "image_alt", label: "Image Alt", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      {
        key: "form",
        title: "Form",
        fields: [
          { key: "heading", label: "Form Heading", type: "text" },
          { key: "success_heading", label: "Success Heading", type: "text" },
          { key: "success_text", label: "Success Text", type: "textarea" },
          { key: "success_button", label: "Success Button", type: "text" },
          { key: "name_label", label: "Name Label", type: "text" },
          { key: "email_label", label: "Email Label", type: "text" },
          { key: "subject_label", label: "Subject Label", type: "text" },
          { key: "message_label", label: "Message Label", type: "text" },
          { key: "submit_text", label: "Submit Button", type: "text" },
          { key: "loading_text", label: "Loading Text", type: "text" },
        ],
      },
      {
        key: "info",
        title: "Contact Info Panel",
        fields: [
          { key: "heading", label: "Heading", type: "text" },
          { key: "bottom_quote", label: "Bottom Quote", type: "textarea" },
        ],
      },
      {
        key: "divider",
        title: "Divider Image",
        fields: [
          { key: "image_url", label: "Image", type: "image" },
          { key: "image_alt", label: "Image Alt", type: "text" },
        ],
      },
    ],
  },
  "shipping-returns": {
    label: "Shipping & Returns",
    sections: [
      {
        key: "hero",
        title: "Page Header",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "title", label: "Title", type: "text" },
        ],
      },
      {
        key: "shipping",
        title: "Shipping",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "timelines_title", label: "Timelines Title", type: "text" },
          { key: "lahore", label: "Lahore Timeline", type: "text" },
          {
            key: "other_cities",
            label: "Other Cities Timeline",
            type: "text",
          },
          { key: "remote_areas", label: "Remote Areas Timeline", type: "text" },
          {
            key: "processing_note",
            label: "Processing Note",
            type: "textarea",
          },
          {
            key: "free_shipping_note",
            label: "Free Shipping Note",
            type: "textarea",
          },
        ],
      },
      {
        key: "tracking",
        title: "Order Tracking",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      {
        key: "returns",
        title: "Returns & Exchanges",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "eligibility_title", label: "Eligibility Title", type: "text" },
          { key: "eligibility_1", label: "Eligibility 1", type: "text" },
          { key: "eligibility_2", label: "Eligibility 2", type: "text" },
          { key: "eligibility_3", label: "Eligibility 3", type: "text" },
          { key: "eligibility_4", label: "Eligibility 4", type: "text" },
          {
            key: "how_to_title",
            label: "How to Initiate Title",
            type: "text",
          },
          { key: "step_1", label: "Step 1", type: "text" },
          { key: "step_2", label: "Step 2", type: "text" },
          { key: "step_3", label: "Step 3", type: "text" },
          { key: "step_4", label: "Step 4", type: "text" },
          { key: "step_5", label: "Step 5", type: "text" },
          { key: "refund_note", label: "Refund Note", type: "textarea" },
        ],
      },
      {
        key: "damaged",
        title: "Damaged Items",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      {
        key: "contact_note",
        title: "Contact Note",
        fields: [
          { key: "text", label: "Text", type: "textarea" },
        ],
      },
    ],
  },
  "privacy-policy": {
    label: "Privacy Policy",
    sections: [
      {
        key: "hero",
        title: "Page Header",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "last_updated", label: "Last Updated", type: "text" },
        ],
      },
      {
        key: "intro",
        title: "Introduction",
        fields: [
          { key: "text", label: "Text", type: "textarea" },
        ],
      },
      {
        key: "collect",
        title: "Information We Collect",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "intro", label: "Intro", type: "text" },
          { key: "personal", label: "Personal Information", type: "textarea" },
          {
            key: "account",
            label: "Account Information",
            type: "textarea",
          },
          { key: "usage", label: "Usage Data", type: "textarea" },
          { key: "cookies", label: "Cookies", type: "textarea" },
        ],
      },
      {
        key: "use",
        title: "How We Use Information",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "intro", label: "Intro", type: "text" },
          {
            key: "items",
            label: "Items (separate with |||)",
            type: "textarea",
          },
        ],
      },
      {
        key: "sharing",
        title: "Information Sharing",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "courier", label: "Courier Partners", type: "textarea" },
          {
            key: "payment",
            label: "Payment Processors",
            type: "textarea",
          },
          { key: "legal", label: "Legal Authorities", type: "textarea" },
        ],
      },
      {
        key: "security",
        title: "Data Security",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      {
        key: "rights",
        title: "Your Rights",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "intro", label: "Intro", type: "text" },
          {
            key: "items",
            label: "Items (separate with |||)",
            type: "textarea",
          },
        ],
      },
      {
        key: "cookies_section",
        title: "Cookies",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      {
        key: "changes",
        title: "Changes to Policy",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      {
        key: "contact_section",
        title: "Contact",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  "not-found": {
    label: "404 Page",
    sections: [
      {
        key: "content",
        title: "404 Page Content",
        fields: [
          { key: "code", label: "Error Code", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "cta_text", label: "Button Text", type: "text" },
        ],
      },
    ],
  },
  "product-detail": {
    label: "Product Pages",
    sections: [
      {
        key: "trust_badges",
        title: "Trust Badges",
        fields: [
          { key: "badge_1_title", label: "Badge 1 Title", type: "text" },
          { key: "badge_1_text", label: "Badge 1 Text", type: "text" },
          { key: "badge_2_title", label: "Badge 2 Title", type: "text" },
          { key: "badge_2_text", label: "Badge 2 Text", type: "text" },
          { key: "badge_3_title", label: "Badge 3 Title", type: "text" },
          { key: "badge_3_text", label: "Badge 3 Text", type: "text" },
        ],
      },
      {
        key: "reviews",
        title: "Reviews",
        fields: [
          { key: "title", label: "Title", type: "text" },
          {
            key: "empty_message",
            label: "Empty State Message",
            type: "textarea",
          },
        ],
      },
      {
        key: "related",
        title: "Related Products",
        fields: [
          { key: "title", label: "Title", type: "text" },
        ],
      },
    ],
  },
  global: {
    label: "Global",
    sections: [
      {
        key: "seo",
        title: "SEO & Meta",
        fields: [
          { key: "default_title", label: "Default Page Title", type: "text" },
          {
            key: "title_template",
            label: "Title Template",
            type: "text",
            help: "Use %s for page name",
          },
          {
            key: "description",
            label: "Meta Description",
            type: "textarea",
          },
          { key: "og_title", label: "OpenGraph Title", type: "text" },
          {
            key: "og_description",
            label: "OpenGraph Description",
            type: "textarea",
          },
          { key: "og_image", label: "OG Image", type: "image" },
          {
            key: "schema_description",
            label: "Schema Description",
            type: "textarea",
          },
        ],
      },
      {
        key: "whatsapp",
        title: "WhatsApp",
        fields: [
          {
            key: "message_template",
            label: "Pre-filled Message",
            type: "textarea",
          },
        ],
      },
    ],
  },
}

type InitialContent = {
  id: string
  page_slug: string
  section_key: string
  content_key: string
  content_value: string | null
  content_type: string
  sort_order: number
}

type ContentState = Record<string, Record<string, Record<string, string>>>

function buildInitialState(contents: InitialContent[]): ContentState {
  const state: ContentState = {}
  for (const item of contents) {
    if (!state[item.page_slug]) state[item.page_slug] = {}
    if (!state[item.page_slug][item.section_key])
      state[item.page_slug][item.section_key] = {}
    state[item.page_slug][item.section_key][item.content_key] =
      item.content_value ?? ""
  }
  return state
}

interface ContentEditorProps {
  initialContents: InitialContent[]
}

export function ContentEditor({ initialContents }: ContentEditorProps) {
  const [state, setState] = useState<ContentState>(() =>
    buildInitialState(initialContents)
  )
  const [activeTab, setActiveTab] = useState<string>(
    Object.keys(PAGE_CONFIGS)[0]
  )
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  )
  const [saving, setSaving] = useState(false)

  const toggleSection = useCallback((slug: string, sectionKey: string) => {
    const id = `${slug}:${sectionKey}`
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const updateValue = useCallback(
    (pageSlug: string, sectionKey: string, contentKey: string, value: string) => {
      setState((prev) => ({
        ...prev,
        [pageSlug]: {
          ...prev[pageSlug],
          [sectionKey]: {
            ...prev[pageSlug]?.[sectionKey],
            [contentKey]: value,
          },
        },
      }))
    },
    []
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const pageConfig = PAGE_CONFIGS[activeTab]
      if (!pageConfig) return

      const values: Record<string, string> = {}
      for (const section of pageConfig.sections) {
        const sectionState = state[activeTab]?.[section.key] ?? {}
        for (const field of section.fields) {
          values[`${section.key}.${field.key}`] = sectionState[field.key] ?? ""
        }
      }

      const entries = Object.entries(values).map(([dotKey, content_value]) => {
        const [section_key, content_key] = dotKey.split(".")
        return { section_key, content_key, content_value }
      })
      await savePageContents(activeTab, entries)
      toast.success(`${pageConfig.label} content saved successfully`)
    } catch (error) {
      console.error("Failed to save content:", error)
      toast.error("Failed to save content. Please try again.")
    } finally {
      setSaving(false)
    }
  }, [activeTab, state])

  const isSectionCollapsed = (slug: string, sectionKey: string) => {
    return collapsedSections.has(`${slug}:${sectionKey}`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <div className="flex overflow-x-auto scrollbar-none">
          {Object.entries(PAGE_CONFIGS).map(([slug, config]) => (
            <button
              key={slug}
              onClick={() => setActiveTab(slug)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === slug
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground/70"
              )}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {PAGE_CONFIGS[activeTab]?.sections.map((section) => {
          const collapsed = isSectionCollapsed(activeTab, section.key)
          return (
            <Card key={section.key}>
              <button
                type="button"
                onClick={() => toggleSection(activeTab, section.key)}
                className="flex items-center justify-between w-full text-left"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                  <CardTitle className="text-base font-medium">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <div className="pr-4">
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {!collapsed && (
                <CardContent className="space-y-4 pt-0">
                  {section.fields.map((field) => {
                    const currentValue =
                      state[activeTab]?.[section.key]?.[field.key] ?? ""
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key} className="text-sm font-medium">
                          {field.label}
                        </Label>
                        {field.help && (
                          <p className="text-xs text-muted-foreground">
                            {field.help}
                          </p>
                        )}
                        {field.type === "text" && (
                          <Input
                            id={field.key}
                            value={currentValue}
                            onChange={(e) =>
                              updateValue(
                                activeTab,
                                section.key,
                                field.key,
                                e.target.value
                              )
                            }
                          />
                        )}
                        {field.type === "textarea" && (
                          <Textarea
                            id={field.key}
                            value={currentValue}
                            onChange={(e) =>
                              updateValue(
                                activeTab,
                                section.key,
                                field.key,
                                e.target.value
                              )
                            }
                            rows={3}
                          />
                        )}
                        {field.type === "image" && (
                          <ImageUploader
                            value={currentValue}
                            onChange={(url) =>
                              updateValue(
                                activeTab,
                                section.key,
                                field.key,
                                url ?? ""
                              )
                            }
                            endpoint="/api/admin/upload/media"
                            folder="cms"
                          />
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="border-t bg-background p-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  )
}
