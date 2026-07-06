"use client";

import Link from "next/link";
import { useState } from "react";
import Reveal from "@/components/Reveal";
import { profile, projects } from "@/lib/content";

const titleBySlug = Object.fromEntries(projects.map((p) => [p.slug, p.title]));

/* each discipline gets its own hue so the wall of chips reads as a map,
   not a monochrome list */
const TINTS: Record<string, string> = {
  "AI / LLM": "139, 124, 255", // violet
  "Voice AI": "103, 232, 249", // cyan
  Backend: "255, 184, 107", // amber
  "Frontend / Mobile": "244, 154, 193", // rose
  "Deployment / LLMOps": "126, 231, 168", // mint
};
const FALLBACK_TINT = "139, 124, 255";

/** Skills as evidence: hover a chip to see where it's proven in production. */
export default function Toolkit() {
  const [hover, setHover] = useState<{ g: number; i: number } | null>(null);

  return (
    <section className="container-x py-28 sm:py-36">
      <Reveal as="p" className="eyebrow">
        Toolkit
      </Reveal>
      <Reveal
        as="p"
        delay={50}
        className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-mut"
      >
        No skill bars, no percentages. Hover anything below to see where
        it&apos;s proven in production.
      </Reveal>

      <div className="mt-10 flex flex-col">
        {profile.skills.map((s, gi) => {
          const tint = TINTS[s.group] ?? FALLBACK_TINT;
          const active = hover?.g === gi ? s.items[hover.i] : null;
          const hasEvidence =
            !!active && (("in" in active && active.in?.length) || ("note" in active && active.note));
          return (
            <Reveal
              key={s.group}
              delay={Math.min(gi * 50, 150)}
              className="grid grid-cols-1 gap-4 border-t border-line py-6 last:border-b sm:grid-cols-[220px_1fr] sm:gap-10"
            >
              <h3
                className="pt-2 font-mono text-xs tracking-[0.25em]"
                style={{ color: `rgb(${tint})` }}
              >
                {s.group.toUpperCase()}
              </h3>
              <div>
                <div className="flex flex-wrap gap-2">
                  {s.items.map((it, ii) => {
                    const lit = hover?.g === gi && hover.i === ii;
                    return (
                      <span
                        key={it.name}
                        tabIndex={0}
                        onMouseEnter={() => setHover({ g: gi, i: ii })}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover({ g: gi, i: ii })}
                        onBlur={() => setHover(null)}
                        className={`cursor-default rounded-full border px-3.5 py-1.5 text-[13px] transition-all duration-300 ${
                          lit ? "-translate-y-0.5 text-ink" : "text-ink2"
                        }`}
                        style={
                          lit
                            ? {
                                borderColor: `rgba(${tint}, 0.85)`,
                                background: `rgba(${tint}, 0.14)`,
                                boxShadow: `0 8px 30px -8px rgba(${tint}, 0.45)`,
                              }
                            : {
                                borderColor: `rgba(${tint}, 0.3)`,
                                background: `rgba(${tint}, 0.05)`,
                              }
                        }
                      >
                        {it.name}
                      </span>
                    );
                  })}
                </div>
                <p
                  className={`mt-4 h-5 font-mono text-[11px] tracking-wide transition-opacity duration-300 ${
                    hasEvidence ? "opacity-100" : "opacity-0"
                  }`}
                  aria-live="polite"
                >
                  <span className="text-mut">
                    {active && "in" in active && active.in?.length
                      ? "PROVEN IN → "
                      : "BACKED BY → "}
                  </span>
                  {active &&
                    "in" in active &&
                    active.in?.map((slug, k) => (
                      <span key={slug}>
                        {k > 0 && <span className="text-mut"> · </span>}
                        <Link
                          href={`/work/${slug}`}
                          className="text-acc2 hover:underline"
                        >
                          {titleBySlug[slug]}
                        </Link>
                      </span>
                    ))}
                  {active && "note" in active && active.note && (
                    <span className="text-acc2">
                      {"in" in active && active.in?.length ? " · " : ""}
                      {active.note}
                    </span>
                  )}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
