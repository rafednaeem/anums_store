import Link from "next/link";
import { getPageContent, cms } from "@/lib/cms";

export default async function NotFound() {
  const content = await getPageContent("not-found");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-cormorant text-6xl font-bold text-foreground">
        {cms(content, "content", "code", "404")}
      </h1>
      <h2 className="mt-4 font-cormorant text-3xl font-semibold text-foreground">
        {cms(content, "content", "title", "Page Not Found")}
      </h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        {cms(content, "content", "description", "The page you're looking for doesn't exist or has been moved.")}
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {cms(content, "content", "cta_text", "Back to Home")}
      </Link>
    </div>
  );
}
