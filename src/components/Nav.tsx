"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { profile } from "@/lib/content";

const links = [
  { href: "/#work", id: "work", label: "Work" },
  { href: "/#about", id: "about", label: "About" },
  { href: "/#agent", id: "agent", label: "Agent" },
  { href: "/#contact", id: "contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [spy, setSpy] = useState("");
  const pathname = usePathname();
  // the highlight only applies while on the homepage
  const active = pathname === "/" ? spy : "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // scrollspy: light up the section currently in view (homepage only)
  useEffect(() => {
    if (pathname !== "/") return;
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSpy(entry.target.id);
        }
      },
      // a horizontal band around the middle of the viewport decides
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((el) => io.observe(el));

    // clear the highlight back at the very top (hero)
    const onTop = () => {
      if (window.scrollY < window.innerHeight * 0.4) setSpy("");
    };
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        open
          ? "border-b border-line bg-bg"
          : scrolled
            ? "border-b border-line bg-bg/85 backdrop-blur-md"
            : "border-b border-transparent"
      }`}
    >
      <nav className="container-x flex h-[68px] items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm tracking-[0.18em] text-ink"
          aria-label="Home"
          onClick={() => setOpen(false)}
        >
          KAUSTUBH<span className="text-acc"> WATANE</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active === l.id ? "true" : undefined}
              className={`relative text-sm transition-colors ${
                active === l.id
                  ? "text-acc2"
                  : "text-ink2 hover:text-ink"
              }`}
            >
              {l.label}
              <span
                className={`absolute -bottom-1.5 left-0 h-px bg-acc2 transition-all duration-300 ${
                  active === l.id ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
              />
            </Link>
          ))}
          <a
            href={profile.resumeFile}
            download
            className="rounded-full border border-line-strong px-4 py-1.5 text-sm text-ink transition-colors hover:border-acc hover:text-acc2"
          >
            Résumé
          </a>
        </div>

        <button
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span
            className={`h-px w-6 bg-ink transition-transform duration-300 ${
              open ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-ink transition-transform duration-300 ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* mobile menu */}
      <div
        className={`fixed inset-x-0 bottom-0 top-[68px] z-40 flex flex-col bg-bg transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="container-x flex flex-1 flex-col pt-8">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-baseline justify-between border-b border-line py-5 text-3xl font-medium transition-all duration-500 ${
                active === l.id ? "text-acc2" : "text-ink"
              } ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
            >
              {l.label}
              {active === l.id && (
                <span className="font-mono text-[10px] tracking-[0.3em] text-mut">
                  YOU&apos;RE HERE
                </span>
              )}
            </Link>
          ))}
          <a
            href={profile.resumeFile}
            download
            className={`py-6 font-mono text-sm tracking-[0.2em] text-acc2 transition-all duration-500 ${
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: open ? "300ms" : "0ms" }}
          >
            DOWNLOAD RÉSUMÉ ↓
          </a>

          <div
            className={`mt-auto border-t border-line py-6 transition-all duration-500 ${
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: open ? "360ms" : "0ms" }}
          >
            <a
              href={`mailto:${profile.email}`}
              className="block text-sm text-ink2"
              onClick={() => setOpen(false)}
            >
              {profile.email}
            </a>
            <div className="mt-3 flex gap-6 font-mono text-[11px] tracking-[0.18em] text-mut">
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LINKEDIN ↗
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GITHUB ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
