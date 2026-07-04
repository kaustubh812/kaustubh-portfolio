import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/content";
import Diagram from "@/components/Diagram";
import Reveal from "@/components/Reveal";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: `${project.tagline}. ${project.description}`,
  };
}

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) notFound();
  const project = projects[idx];
  const next = projects[(idx + 1) % projects.length];

  return (
    <main className="container-x pb-24 pt-32 sm:pt-40">
      {/* header */}
      <Link
        href="/#work"
        className="font-mono text-xs tracking-[0.2em] text-mut transition-colors hover:text-ink"
      >
        ← ALL WORK
      </Link>

      <div className="mt-10 max-w-[900px]">
        <p className="eyebrow">
          {project.index} · {project.org} · {project.period}
        </p>
        <h1 className="mt-6 text-[clamp(40px,7vw,92px)] font-semibold leading-[1.02] tracking-[-0.03em]">
          {project.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink2 sm:text-xl">
          {project.tagline}
        </p>
      </div>

      {/* meta */}
      <div className="mt-14 grid grid-cols-1 gap-6 border-y border-line py-8 sm:grid-cols-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-mut">
            ROLE
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink2">
            {project.role}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-mut">
            STACK
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink2">
            {project.stack.join(" · ")}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-mut">
            {project.confidential ? "NOTE" : "LINKS"}
          </p>
          {project.confidential ? (
            <p className="mt-2 text-sm leading-relaxed text-ink2">
              Internal {project.org} system — shown here as architecture and
              outcomes, not screenshots.
            </p>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-ink2">
              {project.links?.length
                ? project.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-4 text-acc2 hover:underline"
                    >
                      {l.label} ↗
                    </a>
                  ))
                : "Personal project — ask me about it."}
            </p>
          )}
        </div>
      </div>

      {/* metrics */}
      <div className="mt-14 grid grid-cols-2 gap-8 lg:grid-cols-4">
        {project.metrics.map((m) => (
          <Reveal key={m.label} className="border-l border-line pl-5">
            <p className="text-[clamp(28px,3.4vw,48px)] font-semibold leading-none tracking-[-0.02em] text-ink">
              {m.value}
            </p>
            <p className="mt-2.5 max-w-[22ch] text-[13px] leading-snug text-mut">
              {m.label}
            </p>
          </Reveal>
        ))}
      </div>

      {/* body */}
      <div className="mt-24 flex max-w-[820px] flex-col gap-20">
        <Reveal>
          <h2 className="eyebrow">The problem</h2>
          <p className="mt-6 text-[17px] leading-[1.85] text-ink2">
            {project.problem}
          </p>
        </Reveal>

        <Reveal>
          <h2 className="eyebrow">The approach</h2>
          <ul className="mt-6 flex flex-col gap-5">
            {project.approach.map((a, i) => (
              <li key={i} className="flex gap-5">
                <span className="mt-0.5 font-mono text-xs text-acc2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[15.5px] leading-[1.8] text-ink2">{a}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal className="mt-20">
        <h2 className="eyebrow">Architecture</h2>
        <div className="mt-6">
          <Diagram diagram={project.diagram} />
        </div>
      </Reveal>

      <div className="mt-20 flex max-w-[820px] flex-col gap-20">
        <Reveal>
          <h2 className="eyebrow">Decisions that mattered</h2>
          <div className="mt-6 flex flex-col gap-8">
            {project.decisions.map((d) => (
              <div key={d.title} className="rounded-xl border border-line p-6 sm:p-7">
                <h3 className="text-lg font-semibold tracking-[-0.01em]">
                  {d.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.8] text-ink2">
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <h2 className="eyebrow">Outcomes</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {project.outcomes.map((o, i) => (
              <li key={i} className="flex gap-4">
                <span aria-hidden className="mt-1 text-acc">
                  ✓
                </span>
                <p className="text-[15.5px] leading-[1.8] text-ink2">{o}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* next */}
      <Link
        href={`/work/${next.slug}`}
        className="group mt-28 flex items-end justify-between border-t border-line pt-10"
      >
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-mut">
            NEXT CASE STUDY
          </p>
          <p className="mt-3 text-[clamp(28px,4vw,52px)] font-semibold tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-2">
            {next.title}
          </p>
        </div>
        <span className="text-2xl text-mut transition-colors group-hover:text-acc2">
          ↗
        </span>
      </Link>
    </main>
  );
}
