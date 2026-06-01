import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <AuthForm mode="forgot" />
      <p className="mt-6 text-center text-sm">
        Remembered it? <Link href="/login" className="font-bold text-ethereal-blush">Back to login</Link>
      </p>
    </div>
  );
}
