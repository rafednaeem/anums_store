"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { CreditCard, Banknote, Wallet, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { calculateOrderTotals, FREE_SHIPPING_THRESHOLD } from "@/lib/orders";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    city: "Lahore",
    postalCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const { subtotal, shipping, total } = calculateOrderTotals(items);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.address) newErrors.address = "Address is required";
    
    const phoneRegex = /^(\+92|0)[0-9]{10}$/;
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid Pakistani phone number (e.g. 03001234567)";
    }

    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submittedOnce) {
      const newErrors = validate();
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    setSubmittedOnce(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before proceeding.");
      return;
    }

    setLoading(true);
    let userId: string | undefined;
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) userId = userData.user.id;

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
          paymentMethod,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create order");

      if (data.redirect) {
        window.location.href = data.redirect;
      } else if (data.orderId) {
        clearCart();
        router.push(`/order-confirmation?id=${data.orderId}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-heading text-foreground mb-4">Your Cart is Empty</h1>
        <p className="mb-8 text-foreground/70">Add some items before proceeding to checkout.</p>
        <Link href="/ready-to-wear" className="bg-ethereal-maroon text-ethereal-silver py-3 px-8 font-bold hover:bg-ethereal-maroon transition-colors">
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-heading text-foreground mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form Section */}
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-foreground mb-4 border-b-2 border-ethereal-maroon pb-2">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">First Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full border-2 p-3 outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-ethereal-mint'}`} 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Last Name *</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full border-2 p-3 outline-none transition-colors ${errors.lastName ? 'border-red-500' : 'border-gray-300 focus:border-ethereal-mint'}`} 
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number *</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 03211234567"
                  className={`w-full border-2 p-3 outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-ethereal-mint'}`} 
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Address *</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House/Apartment, Street, Area" 
                  className={`w-full border-2 p-3 outline-none transition-colors ${errors.address ? 'border-red-500' : 'border-gray-300 focus:border-ethereal-mint'}`} 
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">City *</label>
                <select 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 p-3 outline-none focus:border-ethereal-mint transition-colors bg-white"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Multan">Multan</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Postal Code</label>
                <input 
                  type="text" 
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 p-3 outline-none focus:border-ethereal-mint transition-colors" 
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-foreground mb-4 border-b-2 border-ethereal-maroon pb-2">Payment Method</h2>
            <div className="space-y-3">
              <label className={`block border-2 p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-ethereal-mint bg-ethereal-mint/10' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 accent-ethereal-silver" />
                    <span className="font-bold flex items-center gap-2"><Banknote className="w-5 h-5 text-green-600"/> Cash on Delivery (COD)</span>
                  </div>
                </div>
                {paymentMethod === 'cod' && <p className="ml-7 mt-2 text-sm text-gray-600">Pay with cash upon delivery.</p>}
              </label>

              <label className={`block border-2 p-4 cursor-pointer transition-colors ${paymentMethod === 'safepay' ? 'border-ethereal-mint bg-ethereal-mint/10' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="safepay" checked={paymentMethod === 'safepay'} onChange={() => setPaymentMethod('safepay')} className="w-4 h-4 accent-ethereal-silver" />
                    <span className="font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600"/> Safepay / JazzCash / Cards</span>
                  </div>
                </div>
                {paymentMethod === 'safepay' && <p className="ml-7 mt-2 text-sm text-gray-600">You will be redirected securely to Safepay.</p>}
              </label>

              <label className={`block border-2 p-4 cursor-pointer transition-colors ${paymentMethod === 'cashmaal' ? 'border-ethereal-mint bg-ethereal-mint/10' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="cashmaal" checked={paymentMethod === 'cashmaal'} onChange={() => setPaymentMethod('cashmaal')} className="w-4 h-4 accent-ethereal-silver" />
                    <span className="font-bold flex items-center gap-2"><Wallet className="w-5 h-5 text-orange-500"/> Cashmaal</span>
                  </div>
                </div>
                {paymentMethod === 'cashmaal' && <p className="ml-7 mt-2 text-sm text-gray-600">Secure wallet payment via Cashmaal.</p>}
              </label>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-ethereal-maroon text-ethereal-silver py-4 font-bold uppercase tracking-widest text-lg hover:bg-ethereal-maroon hover:text-white transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Order"}
          </button>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 bg-gray-50 p-6 border-t-8 border-ethereal-dark shadow-sm self-start sticky top-24">
          <h2 className="text-xl font-bold uppercase tracking-widest text-foreground mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4">
                <div className="w-16 h-20 bg-gray-200 relative border">
                  <span className="absolute -top-2 -right-2 bg-ethereal-maroon text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                  <p className="text-xs text-gray-500">Size: {item.size}</p>
                </div>
                <div className="font-bold text-sm">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-bold">{shipping === 0 ? "Free" : `Rs. ${shipping.toLocaleString()}`}</span>
            </div>
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-gray-500">
                Add Rs. {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} more for free shipping.
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-2xl font-bold text-ethereal-maroon">Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
