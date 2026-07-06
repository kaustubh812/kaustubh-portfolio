"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { profile } from "@/lib/content";

const HeroScene = dynamic(() => import("@/components/scene/HeroScene"), {
  ssr: false,
});

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-hero]", { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        "[data-hero]",
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power4.out",
          delay: 0.15,
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      <HeroScene />

      <div className="container-x relative z-10 w-full">
        <p data-hero className="eyebrow opacity-0">
          {profile.name} · {profile.role} · {profile.company}
        </p>

        <h1
          data-hero
          className="mt-8 max-w-[13ch] text-[clamp(44px,8.4vw,124px)] font-semibold leading-[1.02] tracking-[-0.03em] opacity-0"
        >
          I build AI that <span className="serif-accent">ships</span> — and{" "}
          <span className="serif-accent">stays shipped</span>.
        </h1>

        <p
          data-hero
          className="mt-9 max-w-[560px] text-base leading-relaxed text-ink2 opacity-0 sm:text-lg"
        >
          {profile.subline}
        </p>

        <div data-hero className="mt-11 flex flex-wrap gap-4 opacity-0">
          <a
            href="#agent"
            className="btn-acc group rounded-full px-6 py-3 text-sm font-medium"
          >
            Interrogate my portfolio{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="#work"
            className="rounded-full border border-line-strong px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-acc hover:text-acc2"
          >
            Selected work
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 font-mono text-[11px] tracking-[0.3em] text-mut">
        SCROLL
      </div>
    </section>
  );
}
