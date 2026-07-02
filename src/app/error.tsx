"use client";

import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="font-cormorant text-4xl font-bold text-foreground">
        Something went wrong
      </h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push("/")}
          className="rounded-md border border-border px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
