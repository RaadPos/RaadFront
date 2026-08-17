/**
 * Root landing. Real stores are served from their own slug (`/<slug>`), fully
 * server-rendered from Supabase. This placeholder will be replaced later.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-ink">
        Raad Storefront
      </h1>
      <p className="max-w-md text-sm text-muted">
        Every published store lives at its own URL —{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] text-ink">
          /your-store-slug
        </code>
        .
      </p>
    </main>
  );
}
