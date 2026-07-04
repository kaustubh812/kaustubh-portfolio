import Image from "next/image";
import Reveal from "@/components/Reveal";
import { profile } from "@/lib/content";

export default function About() {
  return (
    <section id="about" className="border-t border-line bg-bg2/30">
      <div className="container-x grid grid-cols-1 gap-14 py-28 sm:py-36 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Reveal as="p" className="eyebrow">
            About
          </Reveal>
          <Reveal delay={80} className="relative mt-10 max-w-[380px]">
            <div className="absolute -inset-3 rounded-2xl border border-line" />
            <Image
              src="/kaustubh.jpg"
              alt={`${profile.name}, ${profile.role} at ${profile.company}`}
              width={1275}
              height={1234}
              className="relative rounded-xl object-cover"
              priority={false}
            />
          </Reveal>
        </div>

        <div className="flex flex-col justify-center">
          <Reveal
            as="h2"
            className="max-w-[24ch] text-[clamp(28px,3.6vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em]"
          >
            Most AI demos die in review. I build the ones that{" "}
            <span className="serif-accent">survive production</span>.
          </Reveal>

          <div className="mt-9 flex max-w-[62ch] flex-col gap-5">
            {profile.about.map((para, i) => (
              <Reveal
                as="p"
                key={i}
                delay={80 + i * 70}
                className="text-[15.5px] leading-[1.85] text-ink2"
              >
                {para}
              </Reveal>
            ))}
          </div>

          <Reveal delay={280} className="mt-12">
            <p className="font-mono text-[10px] tracking-[0.25em] text-mut">
              PROFESSIONAL CERTIFICATIONS
            </p>
            <ul className="mt-4 flex flex-col">
              {profile.certifications.map((c) => (
                <li
                  key={c.name}
                  className="flex flex-col gap-1 border-t border-line py-4 last:border-b sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <p className="text-xs leading-relaxed text-mut sm:text-right">
                    {c.focus}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={340} className="mt-8 grid gap-4 sm:grid-cols-2">
            {profile.education.map((e) => (
              <div
                key={e.degree}
                className="rounded-lg border border-line p-5"
              >
                <p className="font-mono text-[10px] tracking-[0.25em] text-mut">
                  EDUCATION
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{e.degree}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-mut">
                  {e.school} · {e.period} · {e.note}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
