import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns - Anums Store",
  description: "Delivery times, shipping rates, and return policy for Anums Store Pakistan.",
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-5xl font-heading text-ethereal-lavender mb-8">Shipping & Returns</h1>
      <div className="w-24 h-1 bg-ethereal-blush mb-12"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 border-t-8 border-ethereal-mint shadow-lg">
          <h2 className="text-2xl font-heading text-ethereal-lavender mb-6">Domestic Shipping</h2>
          <div className="space-y-4 text-foreground/80">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="font-bold">Lahore</span>
              <span>1-2 Working Days (Rs. 200)</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="font-bold">Rest of Pakistan</span>
              <span>3-5 Working Days (Rs. 500)</span>
            </div>
            <div className="bg-ethereal-dark/10 p-4 rounded text-ethereal-lavender font-bold text-center border-2 border-ethereal-dark">
              FREE SHIPPING ON ORDERS OVER RS. 10,000
            </div>
          </div>
        </div>

        <div className="bg-white p-8 border-t-8 border-ethereal-blush shadow-lg">
          <h2 className="text-2xl font-heading text-ethereal-lavender mb-6">Returns Policy</h2>
          <p className="text-foreground/80 mb-4">
            We want you to be completely satisfied with your purchase. If you need to return an item, 
            please note our policy:
          </p>
          <ul className="list-disc list-inside text-foreground/80 space-y-2">
            <li>Returns accepted within 7 days of delivery.</li>
            <li>Items must be unworn, unwashed, and with original tags.</li>
            <li>Sale items are non-refundable.</li>
            <li>Store credit will be issued for valid returns.</li>
          </ul>
        </div>
      </div>

      <div className="bg-ethereal-silver/10 p-8 border-2 border-ethereal-silver text-center">
        <p className="text-ethereal-lavender font-body text-lg">
          For international shipping inquiries, please contact us on WhatsApp at <strong>+92 322 4183457</strong>.
        </p>
      </div>
    </div>
  );
}
