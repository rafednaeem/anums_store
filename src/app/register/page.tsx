import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <AuthForm mode="register" />
      <p className="mt-6 text-center text-sm">
        Already have an account? <Link href="/login" className="font-bold text-ethereal-blush">Sign in</Link>
      </p>
    </div>
  );
}
