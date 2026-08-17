import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
      <p className="text-6xl font-extrabold tracking-[-0.03em] text-ink">404</p>
      <h1 className="text-lg font-bold text-ink">Store not found</h1>
      <p className="max-w-sm text-sm text-muted">
        This storefront doesn&apos;t exist or hasn&apos;t been published yet.
      </p>
      <Link
        href="/"
        className="mt-2 text-sm font-bold text-brand transition-colors hover:text-brand-dark"
      >
        Go home
      </Link>
    </main>
  );
}
