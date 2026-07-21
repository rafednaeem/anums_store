import type { Metadata } from "next"
import { getPageContent, cms } from "@/lib/cms"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Anums Store collects, uses, and protects your personal information.",
}

export default async function PrivacyPolicyPage() {
  const content = await getPageContent("privacy-policy")

  let useItems: string[]
  try {
    useItems = JSON.parse(cms(content, "use", "items", '["Process and fulfill your orders","Send order confirmations and shipping updates","Respond to your customer service inquiries","Improve our website and shopping experience","Send promotional communications (only with your consent)","Prevent fraud and ensure transaction security"]'))
  } catch {
    useItems = ["Process and fulfill your orders", "Send order confirmations and shipping updates", "Respond to your customer service inquiries", "Improve our website and shopping experience", "Send promotional communications (only with your consent)", "Prevent fraud and ensure transaction security"]
  }

  let rightsItems: string[]
  try {
    rightsItems = JSON.parse(cms(content, "rights", "items", '["Access the personal information we hold about you","Request correction of inaccurate data","Request deletion of your personal data","Opt out of marketing communications at any time","Withdraw consent for data processing"]'))
  } catch {
    rightsItems = ["Access the personal information we hold about you", "Request correction of inaccurate data", "Request deletion of your personal data", "Opt out of marketing communications at any time", "Withdraw consent for data processing"]
  }

  return (
    <main className="bg-surface text-on-surface">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="pt-32 pb-[120px] px-5 md:px-16">
        <div className="max-w-3xl mx-auto">
          <span className="block font-label-caps text-[12px] tracking-[0.1em] text-heritage-accent mb-6 uppercase">
            {cms(content, "hero", "label", "Legal")}
          </span>
          <h1 className="font-display-lg text-[64px] leading-[72px] tracking-[-0.02em] mb-6">
            {cms(content, "hero", "title", "Privacy Policy")}
          </h1>
          <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">
            {cms(content, "hero", "last_updated", "Last updated: January 2024")}
          </p>
          <div className="h-px w-16 bg-black/10 mt-6" />
        </div>
      </section>

      {/* ── Content ─────────────────────────────────── */}
      <section className="pb-[120px] px-5 md:px-16">
        <div className="max-w-3xl mx-auto space-y-16 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
          <p>
            {cms(content, "intro", "text", "At Anums Store, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.")}
          </p>

          {/* Information We Collect */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              {cms(content, "collect", "title", "Information We Collect")}
            </h2>
            <div className="space-y-4">
              <p>{cms(content, "collect", "intro", "We may collect the following types of information:")}</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>
                  <strong className="text-on-surface">Personal Information:</strong>{" "}
                  {cms(content, "collect", "personal", "Name, email address, phone number, shipping address, and payment information when you place an order")}
                </li>
                <li>
                  <strong className="text-on-surface">Account Information:</strong>{" "}
                  {cms(content, "collect", "account", "Email and password when you create an account")}
                </li>
                <li>
                  <strong className="text-on-surface">Usage Data:</strong>{" "}
                  {cms(content, "collect", "usage", "Browser type, IP address, pages visited, and time spent on our website")}
                </li>
                <li>
                  <strong className="text-on-surface">Cookies:</strong>{" "}
                  {cms(content, "collect", "cookies", "Information stored on your device to improve your browsing experience")}
                </li>
              </ul>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              {cms(content, "use", "title", "How We Use Your Information")}
            </h2>
            <div className="space-y-4">
              <p>{cms(content, "use", "intro", "We use your information to:")}</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                {useItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Information Sharing */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              {cms(content, "sharing", "title", "Information Sharing")}
            </h2>
            <div className="space-y-4">
              <p>
                {cms(content, "sharing", "description", "We do not sell or rent your personal information to third parties. We may share your information with:")}
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>
                  <strong className="text-on-surface">Courier Partners:</strong>{" "}
                  {cms(content, "sharing", "courier", "To deliver your orders to the provided shipping address")}
                </li>
                <li>
                  <strong className="text-on-surface">Payment Processors:</strong>{" "}
                  {cms(content, "sharing", "payment", "To securely process your payments")}
                </li>
                <li>
                  <strong className="text-on-surface">Legal Authorities:</strong>{" "}
                  {cms(content, "sharing", "legal", "When required by law or to protect our legal rights")}
                </li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              {cms(content, "security", "title", "Data Security")}
            </h2>
            <p>
              {cms(content, "security", "description", "We implement industry-standard security measures to protect your personal information, including encrypted data transmission (SSL), secure server infrastructure, and regular security audits. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.")}
            </p>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              {cms(content, "rights", "title", "Your Rights")}
            </h2>
            <div className="space-y-4">
              <p>{cms(content, "rights", "intro", "You have the right to:")}</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                {rightsItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              {cms(content, "cookies_section", "title", "Cookies")}
            </h2>
            <p>
              {cms(content, "cookies_section", "description", "Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us understand how you use our site and remember your preferences. You can control cookie settings through your browser preferences.")}
            </p>
          </div>

          {/* Changes */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              {cms(content, "changes", "title", "Changes to This Policy")}
            </h2>
            <p>
              {cms(content, "changes", "description", "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.")}
            </p>
          </div>

          {/* Contact */}
          <div className="border-t border-outline-variant/20 pt-12">
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              {cms(content, "contact_section", "title", "Contact Us")}
            </h2>
            <p>
              {cms(content, "contact_section", "description", "If you have any questions about this Privacy Policy or how we handle your data, please contact us at info@anumsstore.pk.")}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
