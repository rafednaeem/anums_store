import type { Metadata } from "next"
import { SignupForm } from "./SignupForm"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Anums Store account",
}

export default function SignupPage() {
  return (
    <div className="auth-card w-full max-w-[1000px] grid grid-cols-1 border border-border/30 bg-white overflow-hidden md:grid-cols-2">
      {/* Left Side: Editorial Imagery (Desktop only) */}
      <div className="hidden md:block relative h-full min-h-[600px]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 grayscale hover:grayscale-0"
          style={{
            backgroundImage: "url('/signuppageimage/screen.png')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-ethereal-dark/5" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em]">
            Heritage Collection
          </p>
          <h2 className="font-heading text-3xl leading-tight">
            Crafting the future of traditional textiles.
          </h2>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex flex-col justify-center p-8 md:p-16 lg:p-20">
        <div className="mb-12">
          <h1 className="font-heading text-2xl text-ethereal-dark mb-2 md:text-[28px]">
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Join our curated world of craftsmanship.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
