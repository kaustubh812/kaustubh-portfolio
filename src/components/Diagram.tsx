import { Fragment } from "react";
import type { Project } from "@/lib/content";

/** Renders a project's architecture as a lane-based flow. Pure HTML/CSS, GE-safe. */
export default function Diagram({ diagram }: { diagram: Project["diagram"] }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-bg2/50">
      <figcaption className="border-b border-line px-6 py-4 font-mono text-[11px] tracking-[0.2em] text-mut">
        {diagram.title.toUpperCase()}
      </figcaption>
      <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-stretch lg:gap-4 lg:p-8">
        {diagram.lanes.map((lane, li) => (
          <Fragment key={lane.title}>
            <div className="flex flex-1 flex-col gap-3">
              <p className="font-mono text-[10px] tracking-[0.25em] text-acc2">
                {String(li + 1).padStart(2, "0")} · {lane.title.toUpperCase()}
              </p>
              {lane.nodes.map((n) => (
                <div
                  key={n.label}
                  className="rounded-lg border border-line-strong bg-bg px-4 py-3.5"
                >
                  <p className="text-[13.5px] font-medium leading-snug text-ink">
                    {n.label}
                  </p>
                  {n.sub && (
                    <p className="mt-1 text-[11.5px] leading-snug text-mut">
                      {n.sub}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {li < diagram.lanes.length - 1 && (
              <span
                aria-hidden
                className="flex items-center pl-1 text-mut lg:pl-0"
              >
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:block">→</span>
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </figure>
  );
}
