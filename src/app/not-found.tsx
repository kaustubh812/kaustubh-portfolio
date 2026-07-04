import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-svh flex-col items-center justify-center text-center">
      <p className="eyebrow">404 · Not retrieved</p>
      <h1 className="mt-8 max-w-[16ch] text-[clamp(36px,6vw,84px)] font-semibold leading-[1.05] tracking-[-0.03em]">
        No relevant chunks found for this{" "}
        <span className="serif-accent">query</span>.
      </h1>
      <p className="mt-6 max-w-[44ch] text-[15.5px] leading-relaxed text-ink2">
        The page you asked for isn&apos;t in the index. Even the best retrieval
        pipeline can&apos;t ground an answer in a document that doesn&apos;t
        exist.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-bg transition-colors hover:bg-acc2"
      >
        ← Back to the corpus
      </Link>
    </main>
  );
}
