"use client";

import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated.");
      router.push("/account");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <form onSubmit={handleSubmit} className="mx-auto max-w-md border-t-8 border-ethereal-blush bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-heading text-ethereal-lavender">Set New Password</h1>
        <p className="mb-8 text-sm text-foreground/65">Choose a new password for your Anums Store account.</p>
        <label className="mb-1 block text-sm font-bold text-gray-700">New Password</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required className="mb-6 w-full border-2 border-gray-200 p-3 outline-none focus:border-ethereal-blush" />
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 bg-ethereal-lavender py-3 font-bold uppercase tracking-widest text-ethereal-silver transition-colors hover:bg-ethereal-blush hover:text-white">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
        </button>
      </form>
    </div>
  );
}
