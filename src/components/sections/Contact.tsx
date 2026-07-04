import Reveal from "@/components/Reveal";
import { profile } from "@/lib/content";

export default function Contact() {
  return (
    <section id="contact" className="border-t border-line">
      <div className="container-x flex flex-col items-center py-32 text-center sm:py-44">
        <Reveal as="p" className="eyebrow" >
          Contact
        </Reveal>
        <Reveal
          as="h2"
          delay={60}
          className="mt-8 max-w-[16ch] text-[clamp(40px,7.5vw,104px)] font-semibold leading-[1.02] tracking-[-0.03em]"
        >
          Let&apos;s build something that{" "}
          <span className="serif-accent">ships</span>.
        </Reveal>
        <Reveal delay={140}>
          <a
            href={`mailto:${profile.email}`}
            className="mt-10 inline-block rounded-full bg-ink px-8 py-4 text-sm font-medium text-bg transition-colors hover:bg-acc2"
          >
            {profile.email}
          </a>
        </Reveal>
        <Reveal
          delay={220}
          className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 font-mono text-xs tracking-[0.18em] text-mut"
        >
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            LINKEDIN ↗
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            GITHUB ↗
          </a>
          <a
            href={profile.resumeFile}
            download
            className="transition-colors hover:text-ink"
          >
            RÉSUMÉ ↓
          </a>
          <a
            href={`tel:${profile.phone.replace(/\s/g, "")}`}
            className="transition-colors hover:text-ink"
          >
            {profile.phone}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
