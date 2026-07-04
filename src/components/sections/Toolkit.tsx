import Reveal from "@/components/Reveal";
import { profile } from "@/lib/content";

export default function Toolkit() {
  return (
    <section className="container-x py-28 sm:py-36">
      <Reveal as="p" className="eyebrow">
        Toolkit
      </Reveal>
      <div className="mt-12 flex flex-col">
        {profile.skills.map((s, i) => (
          <Reveal
            key={s.group}
            delay={Math.min(i * 50, 150)}
            className="grid grid-cols-1 gap-2 border-t border-line py-7 last:border-b sm:grid-cols-[220px_1fr] sm:gap-10"
          >
            <h3 className="font-mono text-xs tracking-[0.25em] text-acc2">
              {s.group.toUpperCase()}
            </h3>
            <p className="text-[15px] leading-[1.9] text-ink2">{s.items}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
