import type { Metadata } from "next"
import { storeName, storeEmail, storePhone, whatsappNumber } from "@/lib/constants"
import { ContactForm } from "./ContactForm"

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${storeName}. We're here to help with any questions.`,
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-4xl font-bold text-ethereal-dark">
          Contact Us
        </h1>
        <p className="mt-3 text-muted-foreground">
          Have a question? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ethereal-dark">
            Send us a message
          </h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold text-ethereal-dark">
            Get in touch
          </h2>
          <div className="space-y-4">
            {storeEmail && (
              <div>
                <p className="text-sm font-semibold text-ethereal-dark">Email</p>
                <a
                  href={`mailto:${storeEmail}`}
                  className="text-sm text-muted-foreground hover:text-ethereal-dark"
                >
                  {storeEmail}
                </a>
              </div>
            )}
            {storePhone && (
              <div>
                <p className="text-sm font-semibold text-ethereal-dark">Phone</p>
                <a
                  href={`tel:${storePhone.replace(/\s/g, "")}`}
                  className="text-sm text-muted-foreground hover:text-ethereal-dark"
                >
                  {storePhone}
                </a>
              </div>
            )}
            {whatsappNumber && (
              <div>
                <p className="text-sm font-semibold text-ethereal-dark">WhatsApp</p>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-ethereal-dark"
                >
                  Chat on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
