"use client";

import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

type Mode = "login" | "register" | "forgot";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const title = mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully.");
        router.push("/account");
        router.refresh();
      }

      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (error) throw error;
        toast.success("Account created. Please check your email if verification is enabled.");
        router.push("/account");
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md border-t-8 border-ethereal-blush bg-white p-8 shadow-lg">
      <h1 className="mb-2 text-3xl font-heading text-ethereal-lavender">{title}</h1>
      <p className="mb-8 text-sm text-foreground/65">
        {mode === "forgot" ? "Enter your email and we will send reset instructions." : "Use your Anums Store account to manage orders and saved details."}
      </p>

      {mode === "register" && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-bold text-gray-700">Full Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} className="w-full border-2 border-gray-200 p-3 outline-none focus:border-ethereal-blush" required />
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-bold text-gray-700">Email</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border-2 border-gray-200 p-3 outline-none focus:border-ethereal-blush" required />
      </div>

      {mode !== "forgot" && (
        <div className="mb-6">
          <label className="mb-1 block text-sm font-bold text-gray-700">Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} className="w-full border-2 border-gray-200 p-3 outline-none focus:border-ethereal-blush" required />
        </div>
      )}

      <button disabled={loading} className="flex w-full items-center justify-center gap-2 bg-ethereal-lavender py-3 font-bold uppercase tracking-widest text-ethereal-silver transition-colors hover:bg-ethereal-blush hover:text-white">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : title}
      </button>
    </form>
  );
}
