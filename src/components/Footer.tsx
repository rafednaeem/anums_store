import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-ethereal-cream border-t border-ethereal-silver/30 py-14 mt-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-heading text-xl font-light tracking-[0.4em] uppercase text-foreground mb-8">
          Anums Store Heritage
        </h2>
        <div className="flex justify-center gap-10 text-[11px] tracking-[0.18em] uppercase text-foreground/50 mb-8">
          <Link href="/privacy"  className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/shipping" className="hover:text-foreground transition-colors">Shipping &amp; Returns</Link>
          <Link href="/contact"  className="hover:text-foreground transition-colors">Contact Us</Link>
        </div>
        <p className="text-[10px] tracking-widest uppercase text-foreground/30">
          &copy; {new Date().getFullYear()} Anums Store. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
