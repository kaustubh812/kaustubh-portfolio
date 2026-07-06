"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "@/components/Reveal";
import { projects } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

/**
 * Projects along a scroll-drawn serpentine path: one glowing line weaves
 * down the section, drawing itself with scroll; each card lights up as
 * the tip reaches its bend. On mobile the path is dropped and cards stack.
 */

type Geo = {
  w: number;
  h: number;
  d: string;
  pts: { x: number; y: number }[];
};

export default function Work() {
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGGElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  // measure card centres and build the serpentine path through them
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const build = () => {
      const w = list.clientWidth;
      const h = list.scrollHeight;
      // desktop: serpentine between alternating cards; mobile: a straight
      // rail in the left gutter beside full-width cards
      const mobile = window.innerWidth < 768;
      const pts = cardRefs.current.map((el, i) => ({
        x: mobile ? 16 : w * (i % 2 === 0 ? 0.575 : 0.425),
        y: el ? el.offsetTop + el.offsetHeight / 2 : 0,
      }));
      const startX = mobile ? 16 : w * 0.5;
      const all = [{ x: startX, y: -8 }, ...pts, { x: startX, y: h + 8 }];
      let d = `M ${all[0].x} ${all[0].y}`;
      for (let i = 1; i < all.length; i++) {
        const a = all[i - 1];
        const b = all[i];
        const my = (a.y + b.y) / 2;
        d += ` C ${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
      }
      setGeo({ w, h, d, pts });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  // baseline reveal for every card — works on mobile (no path) and
  // guards against hydration finishing after the user already scrolled
  useEffect(() => {
    const els = cardRefs.current.filter(
      (el): el is HTMLAnchorElement => !!el
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            e.target.classList.add("wk-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // scroll-scrubbed line draw + card ignition
  useEffect(() => {
    const path = pathRef.current;
    const list = listRef.current;
    if (!geo || !path || !list) return;
    const tip = tipRef.current;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.strokeDashoffset = "0";
      cardRefs.current.forEach((el) => el?.classList.add("wk-in"));
      tip?.setAttribute("opacity", "0");
      return;
    }

    path.style.strokeDashoffset = `${len}`;
    // cumulative path length at each card ≈ equal bezier segments
    const segs = geo.pts.length + 1;
    const at = geo.pts.map((_, i) => (len * (i + 1)) / segs);

    const st = ScrollTrigger.create({
      trigger: list,
      start: "top 74%",
      end: "bottom 62%",
      scrub: 0.6,
      onUpdate(self) {
        const drawn = len * self.progress;
        path.style.strokeDashoffset = `${len - drawn}`;
        if (tip) {
          const pt = path.getPointAtLength(drawn);
          tip.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
          tip.setAttribute(
            "opacity",
            self.progress > 0.004 && self.progress < 0.996 ? "1" : "0"
          );
        }
        // the card whose node the spark is currently visiting lights up
        const win = (len / segs) * 0.38;
        let lit = -1;
        at.forEach((l, i) => {
          if (Math.abs(drawn - l) < win) lit = i;
        });
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          if (drawn >= at[i] - 40) el.classList.add("wk-in");
          el.classList.toggle("wk-lit", i === lit);
        });
        nodeRefs.current.forEach((c, i) => {
          c?.classList.toggle("wk-node-lit", i === lit);
        });
      },
    });
    return () => st.kill();
  }, [geo]);

  return (
    <section id="work" className="relative py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(640px_420px_at_18%_0%,rgba(139,124,255,0.1),transparent_70%)]"
      />
      <div className="container-x relative">
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

      <div ref={listRef} className="relative mt-20">
        {geo && (
          <svg
            className="pointer-events-none absolute inset-0 z-0"
            width={geo.w}
            height={geo.h}
            viewBox={`0 0 ${geo.w} ${geo.h}`}
            fill="none"
            aria-hidden
          >
            <defs>
              <linearGradient
                id="wk-grad"
                x1="0"
                y1="0"
                x2="0"
                y2={geo.h}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#8b7cff" />
                <stop offset="1" stopColor="#67e8f9" />
              </linearGradient>
            </defs>
            {/* ghost of the full route */}
            <path
              d={geo.d}
              stroke="url(#wk-grad)"
              strokeOpacity="0.18"
              strokeWidth="1.5"
            />
            {/* the drawn line */}
            <path
              ref={pathRef}
              d={geo.d}
              stroke="url(#wk-grad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* a node at each project */}
            {geo.pts.map((pt, i) => (
              <circle
                key={i}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                cx={pt.x}
                cy={pt.y}
                r="4"
                className="wk-node"
                fill="#08080d"
                stroke="#8b7cff"
                strokeWidth="1.5"
              />
            ))}
            {/* the travelling spark */}
            <g ref={tipRef} opacity="0">
              <circle r="10" fill="#b9adff" opacity="0.22" />
              <circle r="3.5" fill="#cfc7ff" />
            </g>
          </svg>
        )}

        <div className="relative z-10 flex flex-col gap-10 pl-10 md:gap-20 md:pl-0">
          {projects.map((p, i) => (
            <div
              key={p.slug}
              className={`flex ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}
            >
              <Link
                href={`/work/${p.slug}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="wk-card group block w-full rounded-2xl border border-line bg-bg2/50 p-7 backdrop-blur-[2px] transition-colors duration-300 hover:border-acc/60 hover:bg-bg2 md:w-[46%] sm:p-8"
              >
                <div className="flex items-baseline justify-between font-mono text-xs tracking-[0.2em] text-mut">
                  <span>
                    {p.index} · <span className="text-acc">{p.org.toUpperCase()}</span>
                  </span>
                  <span
                    aria-hidden
                    className="text-lg tracking-normal text-mut transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acc2"
                  >
                    ↗
                  </span>
                </div>
                <h3 className="mt-5 text-[clamp(24px,2.6vw,36px)] font-semibold leading-tight tracking-[-0.02em]">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink2">
                  {p.tagline}
                </p>
                <p className="mt-5 font-mono text-[11px] leading-relaxed text-mut">
                  {p.stack.slice(0, 4).join(" · ")}
                </p>
                <p className="mt-3 border-t border-line pt-4 text-sm text-ink2">
                  <span className="font-semibold text-warm">
                    {p.metrics[0].value}
                  </span>{" "}
                  {p.metrics[0].label}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
