import Reveal from "@/components/Reveal";
import { profile } from "@/lib/content";

export default function Stats() {
  return (
    <section className="border-y border-line bg-bg2/40">
      <div className="container-x grid grid-cols-2 gap-px lg:grid-cols-4">
        {profile.stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 80}
            className="flex flex-col gap-3 border-line px-2 py-12 sm:px-6 lg:border-l lg:first:border-l-0"
          >
            <span className="text-[clamp(36px,4.5vw,64px)] font-semibold leading-none tracking-[-0.02em] text-ink">
              {s.value}
            </span>
            <span className="max-w-[24ch] text-sm leading-snug text-mut">
              {s.label}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
