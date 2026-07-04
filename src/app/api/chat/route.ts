import Groq from "groq-sdk";
import { buildAgentContext, profile } from "@/lib/content";

export const runtime = "nodejs";

const MODEL = "llama-3.3-70b-versatile";
const MAX_MESSAGES = 16;
const MAX_CHARS = 1500;

// Sliding-window rate limit, per IP, per server instance.
// Groq's own free-tier limits are the hard backstop.
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude memory cap
  return false;
}

const SYSTEM_PROMPT = `You are the portfolio agent on ${profile.name}'s personal website. Visitors — recruiters, hiring managers, engineers — ask you questions about him instead of reading the whole site.

Rules:
- Answer ONLY from the context document below. It is the complete set of facts you know. Never invent projects, employers, dates or metrics.
- If the answer isn't in the context, say so plainly and suggest emailing ${profile.email}.
- Speak about Kaustubh in the third person. Confident, specific, warm — never salesy or gushing.
- Be concise: 1–3 short paragraphs, or a short dash list when listing or comparing things. No headers, no code blocks, no markdown link syntax.
- You may bold the few genuinely important terms with **double asterisks** — project names, key metrics, core technologies. Use it sparingly: 2–5 bolded terms per answer, never whole sentences.
- When pointing to contact details or links, write the bare email address or URL (e.g. ${profile.email}) so it can be linked.
- If asked about topics unrelated to Kaustubh, his work, skills or hiring him, give a one-line friendly redirect back to the portfolio.
- If someone wants to hire or contact him, point to ${profile.email} or his LinkedIn.
- For broad questions (tell me about yourself / summarize him / what's his background), a complete answer covers: his current role and what he ships, the three GE HealthCare systems plus Luna AI, his professional certifications (Building AI Products: Architecture and Orchestration, Microsoft Azure AI Essentials, Docker Foundations), and how to reach him.

Context document:

${buildAgentContext()}`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function badRequest(msg: string) {
  return Response.json({ error: msg }, { status: 400 });
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      {
        error:
          "The agent is offline right now (no API key configured). Email me instead — " +
          profile.email,
      },
      { status: 503 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Slow down a little — try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON.");
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return badRequest("messages[] required.");
  }
  const clean: ChatMessage[] = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      m.content.length === 0
    ) {
      return badRequest("Malformed message.");
    }
    clean.push({ role: m.role, content: m.content.slice(0, MAX_CHARS) });
  }
  if (clean[clean.length - 1].role !== "user") {
    return badRequest("Last message must be from the user.");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...clean],
      temperature: 0.6,
      max_tokens: 700,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch {
          controller.enqueue(
            encoder.encode("\n\n[The stream was interrupted — please retry.]")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "The agent hit a provider error. Try again in a moment, or email " +
          profile.email,
      },
      { status: 502 }
    );
  }
}
