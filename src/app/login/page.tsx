import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <AuthForm mode="login" />
      <div className="mt-6 text-center text-sm">
        <Link href="/register" className="font-bold text-ethereal-blush">Create an account</Link>
        <span className="mx-3 text-gray-300">|</span>
        <Link href="/forgot-password" className="font-bold text-ethereal-lavender">Forgot password?</Link>
      </div>
    </div>
  );
}
