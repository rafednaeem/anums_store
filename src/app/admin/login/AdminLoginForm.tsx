"use client";

import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.app_metadata?.role;

      if (role === "admin") {
        toast.success("Welcome back, Admin.");
        router.push(searchParams.get("redirect") || "/admin");
      } else {
        toast.error("You do not have admin access.");
        await supabase.auth.signOut();
        router.push("/account");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md border-t-8 border-ethereal-blush bg-white p-8 shadow-lg">
      <h1 className="mb-2 text-3xl font-heading text-ethereal-lavender">Admin Login</h1>
      <p className="mb-8 text-sm text-foreground/65">Sign in with your admin account.</p>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-bold text-gray-700">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-gray-200 p-3 outline-none focus:border-ethereal-blush" required />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-bold text-gray-700">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} className="w-full border-2 border-gray-200 p-3 outline-none focus:border-ethereal-blush" required />
      </div>

      <button disabled={loading} className="flex w-full items-center justify-center gap-2 bg-ethereal-lavender py-3 font-bold uppercase tracking-widest text-ethereal-silver transition-colors hover:bg-ethereal-blush hover:text-white">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
      </button>
    </form>
  );
}
