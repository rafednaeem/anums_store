"use client";

import { useState } from "react";
import { MessageCircle, Mail, MapPin, Phone, Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message.");

      setSuccess(true);
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-heading text-ethereal-lavender mb-6">Contact Us</h1>
        <div className="w-24 h-1 bg-ethereal-blush mx-auto mb-6"></div>
        <p className="text-foreground/70 text-lg">We&apos;d love to hear from you. Reach out to us via any of the channels below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-ethereal-mint/10 rounded-full text-ethereal-mint">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Our Studio</h3>
              <p className="text-foreground/70">MM Alam Road, Gulberg III<br/>Lahore, Pakistan<br/>(Appointment Only)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-ethereal-blush/10 rounded-full text-ethereal-blush">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Phone</h3>
              <p className="text-foreground/70">+92 322 4183457</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-ethereal-silver/10 rounded-full text-ethereal-silver">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Email</h3>
              <p className="text-foreground/70">hello@anumsstore.pk</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 border-t-8 border-ethereal-dark shadow-lg">
          {success ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-ethereal-dark mx-auto mb-6" />
              <h2 className="text-2xl font-heading text-ethereal-lavender mb-4">Message Sent!</h2>
              <p className="text-foreground/70 mb-8">Thank you for reaching out. Our team will get back to you shortly.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-ethereal-blush font-bold underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-heading text-ethereal-lavender mb-6">Quick Inquiry</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 p-3 outline-none focus:border-ethereal-blush transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email or Phone</label>
                  <input 
                    type="text" 
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 p-3 outline-none focus:border-ethereal-blush transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                  <textarea 
                    name="message"
                    rows={4} 
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 p-3 outline-none focus:border-ethereal-blush transition-colors"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-ethereal-lavender text-ethereal-silver py-3 font-bold uppercase tracking-widest hover:bg-ethereal-blush hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Message"}
                </button>
                <a 
                  href="https://wa.me/923224183457"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-4 bg-green-500 text-white py-3 font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                </a>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
