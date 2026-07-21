import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Shipping information, delivery timelines, and return policy for Anums Store orders.",
}

export default function ShippingReturnsPage() {
  return (
    <main className="bg-surface text-on-surface">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="pt-32 pb-[120px] px-5 md:px-16">
        <div className="max-w-3xl mx-auto">
          <span className="block font-label-caps text-[12px] tracking-[0.1em] text-heritage-accent mb-6 uppercase">
            Policies
          </span>
          <h1 className="font-display-lg text-[64px] leading-[72px] tracking-[-0.02em] mb-6">
            Shipping &amp; Returns
          </h1>
          <div className="h-px w-16 bg-black/10" />
        </div>
      </section>

      {/* ── Content ─────────────────────────────────── */}
      <section className="pb-[120px] px-5 md:px-16">
        <div className="max-w-3xl mx-auto space-y-20">
          {/* Shipping */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-8">
              Shipping
            </h2>
            <div className="space-y-6 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
              <p>
                We offer nationwide delivery across Pakistan via our trusted
                courier partners. All orders are carefully packaged in our
                signature branded boxes to ensure your pieces arrive in perfect
                condition.
              </p>
              <div>
                <h3 className="font-headline-md text-[28px] leading-[36px] text-on-surface mb-4">
                  Delivery Timelines
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-on-surface">Lahore:</strong> 2–3
                    business days
                  </li>
                  <li>
                    <strong className="text-on-surface">Other cities:</strong> 4–6
                    business days
                  </li>
                  <li>
                    <strong className="text-on-surface">
                      Remote areas:
                    </strong>{" "}
                    6–8 business days
                  </li>
                </ul>
              </div>
              <p>
                Orders placed before 2:00 PM PKT on business days are processed
                the same day. Orders placed after 2:00 PM or on weekends are
                processed the next business day.
              </p>
              <p>
                Free shipping is available on all orders above Rs. 5,000. A flat
                shipping fee of Rs. 250 applies to orders below this threshold.
              </p>
            </div>
          </div>

          {/* Order Tracking */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-8">
              Order Tracking
            </h2>
            <div className="space-y-6 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
              <p>
                Once your order has been dispatched, you will receive a
                confirmation email with a tracking number. You can track your
                order through our courier partner&apos;s website or by contacting
                our team directly.
              </p>
            </div>
          </div>

          {/* Returns */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-8">
              Returns &amp; Exchanges
            </h2>
            <div className="space-y-6 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
              <p>
                We want you to be completely satisfied with your purchase. If for
                any reason you are not, we offer a straightforward return and
                exchange process.
              </p>
              <div>
                <h3 className="font-headline-md text-[28px] leading-[36px] text-on-surface mb-4">
                  Eligibility
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    Returns must be initiated within <strong className="text-on-surface">7 days</strong> of
                    delivery
                  </li>
                  <li>
                    Items must be unworn, unwashed, and in their original
                    packaging with all tags attached
                  </li>
                  <li>
                    Sale items and custom orders are{" "}
                    <strong className="text-on-surface">not eligible</strong> for
                    returns
                  </li>
                  <li>
                    Items must not show any signs of wear, makeup stains, or
                    perfume
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-headline-md text-[28px] leading-[36px] text-on-surface mb-4">
                  How to Initiate a Return
                </h3>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Contact our team via email or WhatsApp with your order number</li>
                  <li>Receive a return authorization and shipping instructions</li>
                  <li>Pack the item securely in its original packaging</li>
                  <li>Ship the item using the provided return label</li>
                  <li>Receive your refund or exchange within 5–7 business days of inspection</li>
                </ol>
              </div>
              <p>
                Refunds are processed to the original payment method. Bank
                transfers may take 3–5 additional business days to reflect in your
                account.
              </p>
            </div>
          </div>

          {/* Damaged Items */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-8">
              Damaged or Defective Items
            </h2>
            <div className="space-y-6 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
              <p>
                If you receive a damaged or defective item, please contact us
                within 48 hours of delivery with photos of the damage. We will
                arrange a free return pickup and offer either a full refund or a
                replacement at no additional cost.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-outline-variant/20 pt-12">
            <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant italic">
              For any questions about shipping or returns, please reach out to us
              at{" "}
              <a
                href="mailto:info@anumsstore.pk"
                className="text-primary hover:text-heritage-accent transition-colors not-italic"
              >
                info@anumsstore.pk
              </a>{" "}
              or via{" "}
              <a
                href="https://wa.me/923224183457"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-heritage-accent transition-colors not-italic"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
