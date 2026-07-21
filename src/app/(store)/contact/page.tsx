import type { Metadata } from "next"
import { storeName, storeEmail, storePhone, whatsappNumber } from "@/lib/constants"
import ContactContent from "./ContactContent"

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${storeName}. We're here to help with any questions.`,
}

export default function ContactPage() {
  return (
    <ContactContent
      email={storeEmail}
      phone={storePhone}
      whatsapp={whatsappNumber}
    />
  )
}
