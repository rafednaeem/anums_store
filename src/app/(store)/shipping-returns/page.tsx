import type { Metadata } from "next"
import { getPageContent, cms } from "@/lib/cms"

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Shipping information, delivery timelines, and return policy for Anums Store orders.",
}

export default async function ShippingReturnsPage() {
  const content = await getPageContent("shipping-returns")

  return (
    <main className="bg-surface text-on-surface">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="pt-32 pb-[120px] px-5 md:px-16">
        <div className="max-w-3xl mx-auto">
          <span className="block font-label-caps text-[12px] tracking-[0.1em] text-heritage-accent mb-6 uppercase">
            {cms(content, "hero", "label", "Policies")}
          </span>
          <h1 className="font-display-lg text-[64px] leading-[72px] tracking-[-0.02em] mb-6">
            {cms(content, "hero", "title", "Shipping & Returns")}
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
              {cms(content, "shipping", "title", "Shipping")}
            </h2>
            <div className="space-y-6 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
              <p>
                {cms(content, "shipping", "description", "We offer nationwide delivery across Pakistan via our trusted courier partners. All orders are carefully packaged in our signature branded boxes to ensure your pieces arrive in perfect condition.")}
              </p>
              <div>
                <h3 className="font-headline-md text-[28px] leading-[36px] text-on-surface mb-4">
                  {cms(content, "shipping", "timelines_title", "Delivery Timelines")}
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-on-surface">Lahore:</strong> {cms(content, "shipping", "lahore", "2–3 business days")}
                  </li>
                  <li>
                    <strong className="text-on-surface">Other cities:</strong> {cms(content, "shipping", "other_cities", "4–6 business days")}
                  </li>
                  <li>
                    <strong className="text-on-surface">Remote areas:</strong> {cms(content, "shipping", "remote_areas", "6–8 business days")}
                  </li>
                </ul>
              </div>
              <p>
                {cms(content, "shipping", "processing_note", "Orders placed before 2:00 PM PKT on business days are processed the same day. Orders placed after 2:00 PM or on weekends are processed the next business day.")}
              </p>
              <p>
                {cms(content, "shipping", "free_shipping_note", "Free shipping is available on all orders above Rs. 5,000. A flat shipping fee of Rs. 250 applies to orders below this threshold.")}
              </p>
            </div>
          </div>

          {/* Order Tracking */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-8">
              {cms(content, "tracking", "title", "Order Tracking")}
            </h2>
            <div className="space-y-6 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
              <p>
                {cms(content, "tracking", "description", "Once your order has been dispatched, you will receive a confirmation email with a tracking number. You can track your order through our courier partner's website or by contacting our team directly.")}
              </p>
            </div>
          </div>

          {/* Returns */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-8">
              {cms(content, "returns", "title", "Returns & Exchanges")}
            </h2>
            <div className="space-y-6 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
              <p>
                {cms(content, "returns", "description", "We want you to be completely satisfied with your purchase. If for any reason you are not, we offer a straightforward return and exchange process.")}
              </p>
              <div>
                <h3 className="font-headline-md text-[28px] leading-[36px] text-on-surface mb-4">
                  {cms(content, "returns", "eligibility_title", "Eligibility")}
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    {cms(content, "returns", "eligibility_1", "Returns must be initiated within 7 days of delivery")}
                  </li>
                  <li>
                    {cms(content, "returns", "eligibility_2", "Items must be unworn, unwashed, and in their original packaging with all tags attached")}
                  </li>
                  <li>
                    {cms(content, "returns", "eligibility_3", "Sale items and custom orders are not eligible for returns")}
                  </li>
                  <li>
                    {cms(content, "returns", "eligibility_4", "Items must not show any signs of wear, makeup stains, or perfume")}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-headline-md text-[28px] leading-[36px] text-on-surface mb-4">
                  {cms(content, "returns", "how_to_title", "How to Initiate a Return")}
                </h3>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>{cms(content, "returns", "step_1", "Contact our team via email or WhatsApp with your order number")}</li>
                  <li>{cms(content, "returns", "step_2", "Receive a return authorization and shipping instructions")}</li>
                  <li>{cms(content, "returns", "step_3", "Pack the item securely in its original packaging")}</li>
                  <li>{cms(content, "returns", "step_4", "Ship the item using the provided return label")}</li>
                  <li>{cms(content, "returns", "step_5", "Receive your refund or exchange within 5–7 business days of inspection")}</li>
                </ol>
              </div>
              <p>
                {cms(content, "returns", "refund_note", "Refunds are processed to the original payment method. Bank transfers may take 3–5 additional business days to reflect in your account.")}
              </p>
            </div>
          </div>

          {/* Damaged Items */}
          <div>
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-8">
              {cms(content, "damaged", "title", "Damaged or Defective Items")}
            </h2>
            <div className="space-y-6 font-body-md text-[16px] leading-[24px] text-on-surface-variant">
              <p>
                {cms(content, "damaged", "description", "If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the damage. We will arrange a free return pickup and offer either a full refund or a replacement at no additional cost.")}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-outline-variant/20 pt-12">
            <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant italic">
              {cms(content, "contact_note", "text", "For any questions about shipping or returns, please reach out to us at info@avosira.com or via WhatsApp.")}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
