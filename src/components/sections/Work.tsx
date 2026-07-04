import Link from "next/link";
import Reveal from "@/components/Reveal";
import { projects } from "@/lib/content";

export default function Work() {
  return (
    <section id="work" className="container-x py-28 sm:py-36">
      <Reveal as="p" className="eyebrow">
        Selected work
      </Reveal>
      <Reveal
        as="h2"
        delay={60}
        className="mt-6 max-w-[20ch] text-[clamp(30px,4.4vw,56px)] font-semibold leading-[1.06] tracking-[-0.02em]"
      >
        Case studies, not screenshots —{" "}
        <span className="serif-accent">how</span> each system was built and{" "}
        <span className="serif-accent">why</span> it worked.
      </Reveal>

      <div className="mt-16">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={Math.min(i * 60, 180)}>
            <Link
              href={`/work/${p.slug}`}
              className="group grid grid-cols-1 gap-4 border-t border-line py-10 transition-colors last:border-b hover:bg-bg2/60 md:grid-cols-[110px_1.35fr_1fr_44px] md:items-center md:gap-8 md:py-12"
            >
              <div className="font-mono text-xs tracking-[0.2em] text-mut">
                {p.index}
                <span className="mt-2 block text-[10px] text-acc">
                  {p.org.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="text-[clamp(26px,3.2vw,44px)] font-semibold leading-tight tracking-[-0.02em] transition-transform duration-500 ease-out group-hover:translate-x-2">
                  {p.title}
                </h3>
                <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-ink2">
                  {p.tagline}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <p className="font-mono text-xs leading-relaxed text-mut">
                  {p.stack.slice(0, 4).join(" · ")}
                </p>
                <p className="text-sm text-ink2">
                  <span className="font-semibold text-acc2">
                    {p.metrics[0].value}
                  </span>{" "}
                  {p.metrics[0].label}
                </p>
              </div>

              <div
                aria-hidden
                className="hidden justify-self-end text-2xl text-mut transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-acc2 md:block"
              >
                ↗
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
