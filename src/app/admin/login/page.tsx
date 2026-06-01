import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Suspense fallback={
        <div className="mx-auto max-w-md border-t-8 border-ethereal-blush bg-white p-8 shadow-lg text-center">
          <p className="text-sm text-foreground/65">Loading...</p>
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}

