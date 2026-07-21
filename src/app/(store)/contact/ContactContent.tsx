"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cms } from "@/lib/cms"
import { inquirySchema, type InquiryInput } from "@/lib/validations"

export default function ContactContent({
  content = {},
  email,
  phone,
  whatsapp,
}: {
  content?: Record<string, string>
  email?: string
  phone?: string
  whatsapp?: string
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(data: InquiryInput) {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!res.ok) {
        const detail = [result.error, result.details, result.hint].filter(Boolean).join(" | ")
        throw new Error(detail || `HTTP ${res.status}`)
      }

      setIsSuccess(true)
      toast.success("Message sent! We'll be in touch soon.")
      reset()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="bg-surface text-on-surface">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative h-[614px] md:h-[716px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <Image
          src={cms(content, "hero", "image_url", "/contact/hero.jpg")}
          alt={cms(content, "hero", "image_alt", "Intricate ivory Pakistani bridal gown with hand-stitched silver embroidery")}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="relative z-20 text-center px-5">
          <h1 className="font-display-lg text-[32px] leading-[40px] md:text-[64px] md:leading-[72px] tracking-[-0.02em] text-on-primary mb-4">
            {cms(content, "hero", "title", "Contact Us")}
          </h1>
          <p className="font-body-lg text-[18px] leading-[28px] text-on-primary/90 max-w-xl mx-auto">
            {cms(content, "hero", "description", "Have a question? We'd love to hear from you.")}
          </p>
        </div>
      </section>

      {/* ── Contact Section ─────────────────────────── */}
      <section className="bg-surface-container-low py-[120px] px-5 md:px-16">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          {/* Left: Form */}
          <div className="space-y-10">
            <div className="border-l-2 border-primary pl-6 py-2">
              <h2 className="font-headline-md text-[28px] leading-[36px] text-primary">
                {cms(content, "form", "heading", "Send us a message")}
              </h2>
            </div>

            {isSuccess ? (
              <div className="border border-green-200 bg-green-50 p-6 text-center">
                <h3 className="text-lg font-semibold text-green-800">
                  {cms(content, "form", "success_heading", "Message sent!")}
                </h3>
                <p className="mt-2 text-sm text-green-700">
                  {cms(content, "form", "success_text", "Thank you for reaching out. We'll get back to you as soon as possible.")}
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 text-sm font-medium text-green-800 underline-offset-4 hover:underline"
                >
                  {cms(content, "form", "success_button", "Send another message")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-2">
                  <label className="font-label-caps text-[12px] tracking-[0.1em] text-on-surface-variant block uppercase">
                    {cms(content, "form", "name_label", "Name *")}
                  </label>
                  <input
                    {...register("name")}
                    className="w-full border-b border-outline bg-transparent py-3 font-body-md text-[16px] leading-[24px] focus:border-primary focus:outline-none transition-colors"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-label-caps text-[12px] tracking-[0.1em] text-on-surface-variant block uppercase">
                    {cms(content, "form", "email_label", "Email *")}
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full border-b border-outline bg-transparent py-3 font-body-md text-[16px] leading-[24px] focus:border-primary focus:outline-none transition-colors"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-label-caps text-[12px] tracking-[0.1em] text-on-surface-variant block uppercase">
                    {cms(content, "form", "subject_label", "Subject *")}
                  </label>
                  <input
                    {...register("subject")}
                    className="w-full border-b border-outline bg-transparent py-3 font-body-md text-[16px] leading-[24px] focus:border-primary focus:outline-none transition-colors"
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-label-caps text-[12px] tracking-[0.1em] text-on-surface-variant block uppercase">
                    {cms(content, "form", "message_label", "Message *")}
                  </label>
                  <textarea
                    rows={4}
                    {...register("message")}
                    className="w-full border-b border-outline bg-transparent py-3 font-body-md text-[16px] leading-[24px] focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-on-primary px-12 py-4 font-button text-[14px] leading-[20px] tracking-[0.05em] uppercase hover:opacity-90 transition-opacity w-full md:w-auto disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {cms(content, "form", "loading_text", "Sending...")}
                    </span>
                  ) : (
                    cms(content, "form", "submit_text", "Send Message")
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: Details */}
          <div className="bg-white p-12 md:p-16 space-y-12 border border-outline-variant/15 shadow-sm">
            <div className="border-l-2 border-heritage-accent pl-6 py-2">
              <h2 className="font-headline-md text-[28px] leading-[36px] text-primary">
                {cms(content, "info", "heading", "Get in touch")}
              </h2>
            </div>

            <div className="space-y-10">
              {email && (
                <div className="flex items-start gap-5">
                  <div className="mt-1 text-secondary text-[28px]">&#9993;</div>
                  <div>
                    <h3 className="font-label-caps text-[12px] tracking-[0.1em] text-on-surface-variant uppercase mb-2">
                      Email
                    </h3>
                    <a
                      href={`mailto:${email}`}
                      className="font-body-lg text-[18px] leading-[28px] text-primary hover:text-heritage-accent transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              )}

              {phone && (
                <div className="flex items-start gap-5">
                  <div className="mt-1 text-secondary text-[28px]">&#9742;</div>
                  <div>
                    <h3 className="font-label-caps text-[12px] tracking-[0.1em] text-on-surface-variant uppercase mb-2">
                      Phone
                    </h3>
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="font-body-lg text-[18px] leading-[28px] text-primary hover:text-heritage-accent transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              )}

              {whatsapp && (
                <div className="flex items-start gap-5">
                  <div className="mt-1 text-secondary text-[28px]">&#128172;</div>
                  <div>
                    <h3 className="font-label-caps text-[12px] tracking-[0.1em] text-on-surface-variant uppercase mb-2">
                      WhatsApp
                    </h3>
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-body-lg text-[18px] leading-[28px] text-primary hover:text-heritage-accent transition-colors"
                    >
                      Chat on WhatsApp
                      <span className="text-sm">&#8599;</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-outline-variant/20">
              <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant italic">
                &ldquo;{cms(content, "info", "bottom_quote", "Our artisans are dedicated to preserving the legacy of traditional craftsmanship. We look forward to assisting you with your inquiries.")}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider Image ───────────────────────────── */}
      <section className="px-5 md:px-16 mb-[120px]">
        <div className="w-full h-80 overflow-hidden relative">
          <Image
            src={cms(content, "divider", "image_url", "/contact/divider.jpg")}
            alt={cms(content, "divider", "image_alt", "Skilled hands delicately embroidering cream-colored silk with silver thread and pearls")}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>
    </main>
  )
}
