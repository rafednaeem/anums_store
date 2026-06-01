"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-8">
      <div className="w-full max-w-2xl border-t-8 border-red-500 bg-white p-8 shadow-lg">
        <h2 className="mb-2 text-3xl font-heading text-red-600">Something went wrong</h2>
        <p className="mb-6 text-sm text-foreground/65">
          An error occurred while rendering the admin panel.
          {error.digest && (
            <span className="ml-2 font-mono text-xs text-foreground/40">
              Error digest: {error.digest}
            </span>
          )}
        </p>
        <div className="mb-6 overflow-auto rounded border border-red-100 bg-red-50 p-4">
          <pre className="whitespace-pre-wrap break-all font-mono text-xs text-red-700">
            {error.message}
          </pre>
        </div>
        <button
          onClick={reset}
          className="bg-ethereal-lavender px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-ethereal-blush"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
