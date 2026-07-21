import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Anums Store collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-surface text-on-surface">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="pt-32 pb-[120px] px-5 md:px-16">
        <div className="max-w-3xl mx-auto">
          <span className="block font-label-caps text-[12px] tracking-[0.1em] text-heritage-accent mb-6 uppercase">
            Legal
          </span>
          <h1 className="font-display-lg text-[64px] leading-[72px] tracking-[-0.02em] mb-6">
            Privacy Policy
          </h1>
          <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">
            Last updated: January 2024
          </p>
          <div className="h-px w-16 bg-black/10 mt-6" />
        </div>
      </section>

      {/* ── Content ─────────────────────────────────── */}
      <section className="pb-[120px] px-5 md:px-16">
        <div className="max-w-3xl mx-auto space-y-16 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
          <p>
            At Anums Store, we value your privacy and are committed to protecting
            your personal information. This Privacy Policy explains how we
            collect, use, and safeguard your data when you visit our website or
            make a purchase.
          </p>

          {/* Information We Collect */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              Information We Collect
            </h2>
            <div className="space-y-4">
              <p>We may collect the following types of information:</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>
                  <strong className="text-on-surface">Personal Information:</strong>{" "}
                  Name, email address, phone number, shipping address, and
                  payment information when you place an order
                </li>
                <li>
                  <strong className="text-on-surface">Account Information:</strong>{" "}
                  Email and password when you create an account
                </li>
                <li>
                  <strong className="text-on-surface">Usage Data:</strong>{" "}
                  Browser type, IP address, pages visited, and time spent on our
                  website
                </li>
                <li>
                  <strong className="text-on-surface">Cookies:</strong>{" "}
                  Information stored on your device to improve your browsing
                  experience
                </li>
              </ul>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              How We Use Your Information
            </h2>
            <div className="space-y-4">
              <p>We use your information to:</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your customer service inquiries</li>
                <li>Improve our website and shopping experience</li>
                <li>
                  Send promotional communications (only with your consent)
                </li>
                <li>Prevent fraud and ensure transaction security</li>
              </ul>
            </div>
          </div>

          {/* Information Sharing */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              Information Sharing
            </h2>
            <div className="space-y-4">
              <p>
                We do not sell or rent your personal information to third
                parties. We may share your information with:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>
                  <strong className="text-on-surface">Courier Partners:</strong>{" "}
                  To deliver your orders to the provided shipping address
                </li>
                <li>
                  <strong className="text-on-surface">Payment Processors:</strong>{" "}
                  To securely process your payments
                </li>
                <li>
                  <strong className="text-on-surface">Legal Authorities:</strong>{" "}
                  When required by law or to protect our legal rights
                </li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              personal information, including encrypted data transmission (SSL),
              secure server infrastructure, and regular security audits. However,
              no method of electronic transmission or storage is 100% secure, and
              we cannot guarantee absolute security.
            </p>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              Your Rights
            </h2>
            <div className="space-y-4">
              <p>You have the right to:</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal data</li>
                <li>Opt out of marketing communications at any time</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </div>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              Cookies
            </h2>
            <p>
              Our website uses cookies to enhance your browsing experience.
              Cookies are small text files stored on your device that help us
              understand how you use our site and remember your preferences. You
              can control cookie settings through your browser preferences.
            </p>
          </div>

          {/* Changes */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated revision date. We
              encourage you to review this policy periodically.
            </p>
          </div>

          {/* Contact */}
          <div className="border-t border-outline-variant/20 pt-12">
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6 text-on-surface">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or how we
              handle your data, please contact us at{" "}
              <a
                href="mailto:info@anumsstore.pk"
                className="text-primary hover:text-heritage-accent transition-colors"
              >
                info@anumsstore.pk
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
