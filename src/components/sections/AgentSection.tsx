"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { profile } from "@/lib/content";

type Msg = { role: "user" | "assistant"; content: string };

/* ---------- rich text: bold highlights + clickable links/emails ---------- */

const LINK_RE =
  /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

function linkify(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  LINK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LINK_RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    const isEmail = token.includes("@") && !token.startsWith("http");
    out.push(
      <a
        key={`${keyBase}-l${i++}`}
        href={isEmail ? `mailto:${token}` : token}
        {...(isEmail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="break-all text-acc2 underline decoration-acc/40 underline-offset-2 transition-colors hover:decoration-acc"
      >
        {token}
      </a>
    );
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last)
      out.push(...linkify(text.slice(last, m.index), `${keyBase}-p${i}`));
    out.push(
      <strong key={`${keyBase}-b${i}`} className="font-semibold text-ink">
        {linkify(m[1], `${keyBase}-bi${i}`)}
      </strong>
    );
    i++;
    last = m.index + m[0].length;
  }
  if (last < text.length)
    out.push(...linkify(text.slice(last), `${keyBase}-t`));
  return out;
}

function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim());
        const isList =
          lines.length > 0 && lines.every((l) => /^\s*[-•*]\s+/.test(l));
        if (isList) {
          return (
            <ul key={bi} className={`flex flex-col gap-1.5 ${bi > 0 ? "mt-3" : ""}`}>
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2.5">
                  <span className="mt-[10px] h-1 w-1 flex-none rounded-full bg-acc" />
                  <span>{inline(l.replace(/^\s*[-•*]\s+/, ""), `${bi}-${li}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className={bi > 0 ? "mt-3" : ""}>
            {inline(block, `${bi}`)}
          </p>
        );
      })}
    </>
  );
}

/** What the TTS engine reads: markdown markers stripped. */
function toSpeech(text: string): string {
  return text.replace(/\*\*/g, "").replace(/^\s*[-•*]\s+/gm, "");
}

function Equalizer() {
  return (
    <span className="flex h-[13px] items-end gap-[3px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="eq-bar"
          style={{ animationDelay: `${i * 130}ms` }}
        />
      ))}
    </span>
  );
}

const SUGGESTIONS = [
  "Why should I hire Kaustubh?",
  "What is Nebula AI?",
  "What's the hardest engineering problem he's solved?",
  "How does he stop LLMs from hallucinating?",
];

/* ---------- Web Speech API (prefixed in Chrome) ---------- */
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type RecognitionEvent = {
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

function createRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export default function AgentSection() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const [latency, setLatency] = useState<{ token: number; audio?: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const spokenChars = useRef(0);
  const pendingUtterances = useRef(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // voice list loads asynchronously in most browsers
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      recRef.current?.abort();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    []
  );

  /* ---------- speaking ---------- */

  function speak(text: string, onStart?: () => void) {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(toSpeech(text));
    const en = voicesRef.current.filter((v) => v.lang.startsWith("en"));
    u.voice =
      en.find((v) => /natural|online|google/i.test(v.name)) ?? en[0] ?? null;
    u.rate = 1.05;
    pendingUtterances.current += 1;
    setSpeaking(true);
    u.onstart = () => onStart?.();
    const done = () => {
      pendingUtterances.current -= 1;
      if (pendingUtterances.current <= 0) {
        pendingUtterances.current = 0;
        setSpeaking(false);
      }
    };
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
  }

  /** Speak completed sentences of the streamed answer as they arrive. */
  function speakProgress(full: string, flush: boolean, onFirstAudio: () => void) {
    const rest = full.slice(spokenChars.current);
    if (!rest.trim()) return;
    if (flush) {
      speak(rest.trim(), onFirstAudio);
      spokenChars.current = full.length;
      return;
    }
    let cut = -1;
    const re = /[.!?](?:\s|$)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(rest))) cut = m.index + 1;
    if (cut > 0) {
      speak(rest.slice(0, cut).trim(), onFirstAudio);
      spokenChars.current += cut;
    }
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    pendingUtterances.current = 0;
    setSpeaking(false);
  }

  /* ---------- listening ---------- */

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = createRecognition();
    if (!rec) {
      setError("Voice input needs Chrome, Edge or Safari — typing works everywhere.");
      return;
    }
    stopSpeaking();
    recRef.current = rec;
    rec.lang = navigator.language?.startsWith("en") ? navigator.language : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    setError(null);
    setInterim("");
    setListening(true);

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      setInterim(interimText);
      if (finalText.trim()) {
        setInterim("");
        setListening(false);
        rec.stop();
        void send(finalText.trim(), true);
      }
    };
    rec.onerror = () => {
      setListening(false);
      setInterim("");
      setError("Didn't catch that — try the mic again, or just type.");
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };
    rec.start();
  }

  /* ---------- asking ---------- */

  async function send(text: string, spoken = false) {
    const question = text.trim();
    if (!question || busy) return;
    const wantVoice = spoken || voiceReplies;
    setError(null);
    setInput("");
    setBusy(true);
    setLatency(null);
    stopSpeaking();
    spokenChars.current = 0;

    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;
    const t0 = performance.now();
    let firstToken = 0;
    let firstAudio = 0;
    const onFirstAudio = () => {
      if (!firstAudio) {
        firstAudio = Math.round(performance.now() - t0);
        setLatency({ token: firstToken, audio: firstAudio });
      }
    };

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
        if (!firstToken && acc.trim()) {
          firstToken = Math.round(performance.now() - t0);
          setLatency({ token: firstToken });
        }
        const snapshot = acc;
        setMessages([...history, { role: "assistant", content: snapshot }]);
        if (wantVoice) speakProgress(acc, false, onFirstAudio);
      }
      if (!acc.trim()) throw new Error("Empty response — try again.");
      if (wantVoice) speakProgress(acc, true, onFirstAudio);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
        setMessages(history);
      }
    } finally {
      setBusy(false);
    }
  }

  /* ---------- UI ---------- */

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
          I build retrieval-grounded voice agents for a living — so this site
          has one. Type, or press the mic and ask out loud: it answers in
          text and speech, and shows you the latency receipts.
        </Reveal>

        <Reveal delay={180} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-line bg-bg">
            {/* header */}
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <p className="font-mono text-[11px] tracking-[0.22em] text-mut">
                PORTFOLIO_AGENT
              </p>
              <div className="flex items-center gap-4 font-mono text-[11px] text-mut">
                {latency && (
                  <span className="hidden text-acc2 sm:block">
                    ⚡ {latency.token}ms first token
                    {latency.audio ? ` · ${latency.audio}ms to voice` : ""}
                  </span>
                )}
                {speaking ? (
                  <span className="flex items-center gap-3">
                    <Equalizer />
                    <button
                      onClick={stopSpeaking}
                      className="text-ink transition-colors hover:text-acc2"
                    >
                      ■ STOP
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setVoiceReplies((v) => !v)}
                    aria-pressed={voiceReplies}
                    className={`transition-colors ${
                      voiceReplies ? "text-acc2" : "hover:text-ink"
                    }`}
                    title="Speak all replies aloud"
                  >
                    {voiceReplies ? "VOICE ON" : "VOICE OFF"}
                  </button>
                )}
              </div>
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
                    Try one of these, or press the mic and just ask —
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

              {messages.map((m, i) => {
                const isSpoken =
                  speaking && m.role === "assistant" && i === messages.length - 1;
                return (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-acc/15 px-4 py-3 text-[14.5px] leading-relaxed text-ink"
                        : `relative mr-auto max-w-[92%] text-[14.5px] leading-[1.8] text-ink2 transition-[padding] ${
                            isSpoken ? "pl-4" : ""
                          }`
                    }
                  >
                    {isSpoken && (
                      <span
                        aria-hidden
                        className="absolute bottom-1 left-0 top-1 w-[2px] animate-pulse rounded-full bg-acc"
                      />
                    )}
                    {m.role === "assistant" ? (
                      m.content ? (
                        <RichText text={m.content} />
                      ) : busy && i === messages.length - 1 ? (
                        <span className="inline-flex gap-1">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acc" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acc [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acc [animation-delay:300ms]" />
                        </span>
                      ) : null
                    ) : (
                      m.content
                    )}
                  </div>
                );
              })}

              {error && (
                <p className="mr-auto rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-[13px] text-red-300">
                  {error}
                </p>
              )}
            </div>

            {/* input */}
            <form
              className="flex items-center gap-2.5 border-t border-line px-4 py-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <button
                type="button"
                onClick={toggleMic}
                aria-label={listening ? "Stop listening" : "Ask by voice"}
                className={`relative flex h-11 w-11 flex-none items-center justify-center rounded-full border transition-colors ${
                  listening
                    ? "border-acc bg-acc/15 text-acc2"
                    : "border-line-strong text-ink2 hover:border-acc hover:text-acc2"
                }`}
              >
                {listening && (
                  <span className="absolute inset-0 animate-ping rounded-full border border-acc opacity-40" />
                )}
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <path d="M12 18v3" />
                </svg>
              </button>

              <input
                value={listening && interim ? interim : input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  listening
                    ? "Listening…"
                    : "Ask about my work, stack, or how something was built…"
                }
                aria-label="Ask the portfolio agent a question"
                maxLength={1500}
                readOnly={listening}
                className={`min-w-0 flex-1 bg-transparent px-2 py-2 text-[14.5px] placeholder:text-mut focus:outline-none ${
                  listening && interim ? "italic text-acc2" : "text-ink"
                }`}
              />
              <button
                type="submit"
                disabled={busy || listening || !input.trim()}
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition-all enabled:hover:bg-acc2 enabled:active:scale-95 disabled:opacity-40"
              >
                {busy ? "…" : "Ask"}
              </button>
            </form>
          </div>

          <p className="mt-4 font-mono text-[11px] leading-relaxed tracking-wide text-mut">
            Answers are grounded in my résumé and case studies. If it
            doesn&apos;t know, it says so — that&apos;s the point. Voice input
            works in Chrome, Edge and Safari.{" "}
            <a href={`mailto:${profile.email}`} className="text-acc2">
              Prefer a human? Email me.
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
