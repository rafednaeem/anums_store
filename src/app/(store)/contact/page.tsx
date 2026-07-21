import type { Metadata } from "next"
import { getPageContent } from "@/lib/cms"
import { storeName, storeEmail, storePhone, whatsappNumber } from "@/lib/constants"
import ContactContent from "./ContactContent"

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${storeName}. We're here to help with any questions.`,
}

export default async function ContactPage() {
  const content = await getPageContent("contact")
  return (
    <ContactContent
      content={content}
      email={storeEmail}
      phone={storePhone}
      whatsapp={whatsappNumber}
    />
  )
}
