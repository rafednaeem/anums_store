import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MessageCircle, MapPin, Truck, ShoppingBag } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import { CartItem } from "@/store/useCartStore";

export const metadata: Metadata = {
  title: "Order Confirmation - Anums Store",
  description: "Thank you for your order!",
};

interface OrderRecord {
  id: string;
  customer_name: string;
  customer_last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string | null;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_items?: {
    id: string;
    product_slug: string | null;
    product_name: string;
    product_image: string | null;
    size: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

async function getOrder(id: string): Promise<OrderRecord | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  if (!searchParams.id) notFound();

  const order = await getOrder(searchParams.id);
  if (!order) notFound();

  const isPaid = order.payment_status === 'paid';
  const isCod = order.payment_method === 'cod';
  const orderItems = order.order_items && order.order_items.length > 0
    ? order.order_items.map((item) => ({
        id: item.product_slug || item.id,
        name: item.product_name,
        image: item.product_image || "",
        size: item.size || "Default",
        quantity: item.quantity,
        price: Number(item.unit_price),
      }))
    : order.items;

  const whatsappMessage = encodeURIComponent(`Hi Anums Store, I'd like to track my order #${order.id}.`);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-ethereal-dark/20 rounded-full mb-6">
          <CheckCircle2 className="w-12 h-12 text-ethereal-dark" />
        </div>
        <h1 className="text-5xl font-heading text-ethereal-lavender mb-4">Thank you, {order.customer_name}!</h1>
        <p className="text-foreground/70 text-lg">Your order has been placed and is being processed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 border-t-8 border-ethereal-mint shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading text-ethereal-lavender">Order Summary</h2>
              <div className="bg-gray-100 px-4 py-2 rounded text-sm font-mono font-bold">#{order.id.slice(0, 8)}</div>
            </div>
            
            <div className="space-y-4 mb-8">
              {orderItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-gray-100 relative overflow-hidden">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" unoptimized />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500">Size: {item.size} x {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-right">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>Rs. {order.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-100 mt-4">
                <span className="text-ethereal-lavender font-heading">Total</span>
                <span className="text-ethereal-blush">Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {isCod && (
            <div className="bg-ethereal-silver text-ethereal-lavender p-6 border-2 border-ethereal-lavender font-bold flex items-center gap-4">
              <div className="p-3 bg-white/50 rounded-full">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="uppercase tracking-widest text-sm">Payment Method: COD</p>
                <p className="text-xl">Payment due on delivery</p>
              </div>
            </div>
          )}

          {isPaid && (
            <div className="bg-ethereal-dark text-white p-6 border-2 border-ethereal-dark font-bold flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="uppercase tracking-widest text-sm">Payment Status</p>
                <p className="text-xl">Payment Confirmed</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 border-t-8 border-ethereal-blush shadow-lg">
            <h3 className="font-heading text-xl text-ethereal-lavender mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ethereal-blush" /> Shipping To
            </h3>
            <div className="text-sm text-foreground/70 space-y-1">
              <p className="font-bold text-foreground">{order.customer_name} {order.customer_last_name}</p>
              <p>{order.address}</p>
              <p>{order.city}{order.postal_code ? `, ${order.postal_code}` : ''}</p>
              <p>Pakistan</p>
              <p className="pt-2">{order.phone}</p>
            </div>
          </div>

          <div className="space-y-4">
            <a 
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923224183457'}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 text-white font-bold py-4 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg"
            >
              <MessageCircle className="w-5 h-5" /> Track on WhatsApp
            </a>
            
            <Link 
              href="/ready-to-wear"
              className="w-full bg-ethereal-lavender text-ethereal-silver font-bold py-4 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-ethereal-blush hover:text-white transition-all shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" /> Continue Shopping
            </Link>
          </div>

          <div className="bg-ethereal-mint/5 p-4 border border-ethereal-mint/20 rounded text-xs text-center text-gray-500">
            Estimated delivery: 1-2 days for Lahore, 3-5 days for other cities.
          </div>
        </div>
      </div>
    </div>
  );
}
