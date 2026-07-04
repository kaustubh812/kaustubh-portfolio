"use client";

/* eslint-disable react-hooks/refs -- the ref is forwarded through createElement
   exactly as JSX would; it is only read inside the effect, never during render */

import {
  createElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** stagger delay in ms */
  delay?: number;
  id?: string;
};

/** Fade-up on first scroll into view. CSS-driven, reduced-motion safe. */
export default function Reveal({
  children,
  as = "div",
  className = "",
  delay = 0,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // also reveal when already scrolled past (e.g. hydration finished
        // after the user scrolled) — otherwise it would stay hidden forever
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // createElement sidesteps JSX's polymorphic-union type blowup
  return createElement(
    as,
    {
      ref,
      id,
      className: `reveal ${className}`,
      style: { "--reveal-delay": `${delay}ms` } as CSSProperties,
    },
    children
  );
}
