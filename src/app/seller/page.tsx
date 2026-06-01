import { Camera, ClipboardList, Store, Truck } from "lucide-react";
import Link from "next/link";

export default function SellerPage() {
  const steps = [
    [Store, "Store Profile", "Seller identity, brand contact details, payout settings, and fulfillment origin."],
    [Camera, "Catalog Uploads", "Product drafts, SKU rules, variants, media quality, and category assignment."],
    [ClipboardList, "Order Queue", "Seller order acceptance, packing status, cancellation reasons, and support notes."],
    [Truck, "Fulfillment", "Shipment tracking numbers, courier handoff, delivery SLAs, and return handling."],
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-ethereal-blush">Seller Operations</p>
        <h1 className="mb-4 text-4xl font-heading text-ethereal-lavender md:text-5xl">Seller Management</h1>
        <p className="text-foreground/65">
          The current store is single-brand. This page defines the seller workflow needed to expand into a marketplace model like Daraz or Amazon.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {steps.map(([Icon, title, copy]) => {
          const StepIcon = Icon as typeof Store;
          return (
            <section key={title as string} className="border border-gray-200 bg-white p-6 shadow-sm">
              <StepIcon className="mb-4 h-7 w-7 text-ethereal-blush" />
              <h2 className="mb-2 text-xl font-heading text-ethereal-lavender">{title as string}</h2>
              <p className="text-sm leading-6 text-foreground/65">{copy as string}</p>
            </section>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link href="/contact" className="inline-block bg-ethereal-lavender px-6 py-3 font-bold uppercase tracking-widest text-ethereal-silver hover:bg-ethereal-blush hover:text-white">
          Apply as Seller
        </Link>
      </div>
    </div>
  );
}
