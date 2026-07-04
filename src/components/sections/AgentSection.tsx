"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import { profile } from "@/lib/content";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Why should I hire Kaustubh?",
  "What is Nebula AI?",
  "How did he get voice latency under 1 second?",
  "What's his strongest RAG experience?",
];

export default function AgentSection() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setError(null);
    setInput("");
    setBusy(true);

    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong — try again.");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages([
          ...history,
          { role: "assistant", content: snapshot },
        ]);
      }
      if (!acc.trim()) {
        throw new Error("Empty response — try again.");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
        setMessages(history); // drop the empty assistant bubble
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="agent" className="border-t border-line bg-bg2/30">
      <div className="container-x py-28 sm:py-36">
        <Reveal as="p" className="eyebrow">
          The live demo
        </Reveal>
        <Reveal
          as="h2"
          delay={60}
          className="mt-6 max-w-[18ch] text-[clamp(30px,4.8vw,64px)] font-semibold leading-[1.05] tracking-[-0.02em]"
        >
          Don&apos;t read my portfolio.{" "}
          <span className="serif-accent">Interrogate it.</span>
        </Reveal>
        <Reveal
          as="p"
          delay={120}
          className="mt-6 max-w-[52ch] text-[15.5px] leading-relaxed text-ink2"
        >
          I build retrieval-grounded agents for a living — so this site has
          one. Ask it anything about my work. Every answer is grounded in my
          résumé and case studies, nothing invented.
        </Reveal>

        <Reveal delay={180} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-line bg-bg">
            {/* header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <p className="font-mono text-[11px] tracking-[0.22em] text-mut">
                PORTFOLIO_AGENT
              </p>
              <p className="hidden font-mono text-[11px] tracking-[0.1em] text-mut sm:block">
                grounded · Llama 3.3 on Groq
              </p>
            </div>

            {/* transcript */}
            <div
              ref={scrollRef}
              className="flex h-[380px] flex-col gap-5 overflow-y-auto scroll-smooth px-5 py-6 sm:px-7"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="m-auto flex max-w-md flex-col items-center gap-5 text-center">
                  <p className="text-sm text-mut">
                    Try one of these, or ask your own —
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-line px-4 py-2 text-[13px] text-ink2 transition-colors hover:border-acc hover:text-acc2"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-acc/15 px-4 py-3 text-[14.5px] leading-relaxed text-ink"
                      : "mr-auto max-w-[92%] text-[14.5px] leading-[1.8] text-ink2 whitespace-pre-wrap"
                  }
                >
                  {m.content ||
                    (busy && i === messages.length - 1 ? (
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acc" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acc [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acc [animation-delay:300ms]" />
                      </span>
                    ) : null)}
                </div>
              ))}

              {error && (
                <p className="mr-auto rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-[13px] text-red-300">
                  {error}
                </p>
              )}
            </div>

            {/* input */}
            <form
              className="flex items-center gap-3 border-t border-line px-4 py-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about my work, stack, or how something was built…"
                aria-label="Ask the portfolio agent a question"
                maxLength={1500}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[14.5px] text-ink placeholder:text-mut focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition-all enabled:hover:bg-acc2 disabled:opacity-40"
              >
                {busy ? "…" : "Ask"}
              </button>
            </form>
          </div>

          <p className="mt-4 font-mono text-[11px] leading-relaxed tracking-wide text-mut">
            Answers are grounded in my résumé and case studies. If it doesn&apos;t
            know, it says so — that&apos;s the point.{" "}
            <a href={`mailto:${profile.email}`} className="text-acc2">
              Prefer a human? Email me.
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
