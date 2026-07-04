/**
 * Single source of truth for all portfolio content.
 * Rendered by the site AND serialized into the agent's grounding context,
 * so the pages and the AI never drift apart.
 */

export const profile = {
  name: "Kaustubh Watane",
  role: "AI/LLM Engineer",
  company: "GE HealthCare",
  location: "Bengaluru, India",
  email: "watanekaustubh@gmail.com",
  phone: "+91 94210 27834",
  linkedin: "https://www.linkedin.com/in/kaustubh-watane-6135b41a3",
  github: "https://github.com/kaustubh812",
  resumeFile: "/Kaustubh_Watane_Resume.pdf",
  headline: "I build AI that ships — and stays shipped.",
  subline:
    "RAG, agentic and voice systems in production at GE HealthCare. Three shipped in 10 months, solo, on a regulated medical-device network.",
  summary:
    "AI Engineer at GE HealthCare who shipped three production AI systems in 10 months — solo, on a regulated medical-device network. The agentic AI workspace was adopted by over 50% of the engineering team and drove 30%+ efficiency gains. Full-stack ownership across architecture, backend, frontend, and deployment.",
  about: [
    "I'm an AI/LLM engineer at GE HealthCare with full-stack ownership across architecture, backend, frontend and deployment. I design secure, on-premise RAG and agentic systems that run fully offline on regulated medical-device networks — no cloud APIs, no shortcuts.",
    "My work centres on retrieval done right — hybrid search, reranking, source-grounded answers — plus real-time voice agents and multi-agent orchestration. I care about the unglamorous parts: eval pipelines, latency budgets, audit logging, and output that enters review ready to approve, not ready to fix.",
    "Before AI I studied Electronics & Telecommunication engineering and completed a PG diploma in Embedded Systems at CDAC ACTS Pune — which is why I'm comfortable all the way down the stack, from GPU inference servers to the hardware the documents describe.",
  ],
  stats: [
    { value: "3", label: "production AI systems shipped at GE HealthCare" },
    { value: "10", label: "months, solo, end-to-end" },
    { value: "50%+", label: "engineering-team adoption of Nebula AI" },
    { value: "500+", label: "users on my indie app, Luna AI" },
  ],
  experience: [
    {
      role: "AI Engineer (Trainee)",
      company: "GE HealthCare",
      location: "Bengaluru",
      period: "Aug 2025 — Present",
      summary:
        "Sole engineer designing, building and deploying three production AI systems (Nebula AI, TestMatrix AI, Atlas AI) on a secure, offline, regulated medical-device network.",
    },
  ],
  education: [
    {
      degree: "PG Diploma in Embedded Systems and Design",
      school: "CDAC ACTS, Pune",
      period: "Aug 2024 — Mar 2025",
      note: "Grade A",
    },
    {
      degree: "B.E. Electronics & Telecommunication",
      school: "Government College of Engineering, Karad",
      period: "2019 — 2023",
      note: "CGPA 7.83/10",
    },
  ],
  certifications: [
    {
      name: "Building AI Products: Architecture and Orchestration",
      focus: "AI system architecture · agent orchestration · LLM application design",
    },
    {
      name: "Microsoft Azure AI Essentials",
      focus: "Azure AI services · cloud AI/ML deployment · responsible AI",
    },
    {
      name: "Docker Foundations",
      focus: "Containerization · Docker Compose · image optimization",
    },
  ],
  skills: [
    {
      group: "AI / LLM",
      items:
        "RAG · Agentic AI · Multi-agent systems · LangGraph · LangChain · Prompt engineering · Tool calling · Embeddings · Hybrid search (BM25 + dense) · Reranking · Cross-encoders · Document parsing / OCR · Evals",
    },
    {
      group: "Voice AI",
      items:
        "Speech-to-text · Text-to-speech · Voice activity detection · Real-time streaming · WebSockets · Sub-second latency pipelines",
    },
    {
      group: "Backend",
      items:
        "Python · FastAPI · SQLAlchemy · Alembic · Pydantic · Node.js · PostgreSQL · Qdrant · REST APIs",
    },
    {
      group: "Frontend / Mobile",
      items: "TypeScript · React · React Native · Expo · Flutter · Next.js",
    },
    {
      group: "Deployment / LLMOps",
      items:
        "Docker · Nginx · Ollama · Linux · Git · On-premise inference · Vercel · Render",
    },
  ],
} as const;

export type DiagramLane = {
  title: string;
  nodes: { label: string; sub?: string }[];
};

export type Project = {
  slug: string;
  index: string;
  org: "GE HealthCare" | "Personal";
  confidential: boolean;
  title: string;
  tagline: string;
  description: string;
  period: string;
  role: string;
  stack: string[];
  metrics: { value: string; label: string }[];
  problem: string;
  approach: string[];
  diagram: { title: string; lanes: DiagramLane[] };
  decisions: { title: string; body: string }[];
  outcomes: string[];
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "nebula-ai",
    index: "01",
    org: "GE HealthCare",
    confidential: true,
    title: "Nebula AI",
    tagline: "A secure, on-premise enterprise AI workspace",
    description:
      "On-premise RAG assistant grown into a full AI workspace — hybrid search with reranking, a sub-second voice agent, a Code Studio, smart notes and an admin panel. Adopted by 50%+ of the engineering team.",
    period: "2025 — present",
    role: "Sole engineer — architecture, backend, frontend, deployment",
    stack: ["FastAPI", "PostgreSQL", "Qdrant", "Ollama", "LangGraph", "React"],
    metrics: [
      { value: "50%+", label: "engineering-team adoption" },
      { value: "30%+", label: "measured efficiency gain" },
      { value: "<1s", label: "voice-agent response latency" },
      { value: "100%", label: "on-premise — zero cloud calls" },
    ],
    problem:
      "GE HealthCare engineers needed to query thousands of internal documents — specs, procedures, standards — on a regulated medical-device network where no data may leave the premises. No ChatGPT, no cloud APIs, no exceptions. Answers had to be accurate and traceable to their sources, because in a medical-device context a plausible-but-wrong answer is worse than no answer.",
    approach: [
      "Built the retrieval layer first: hybrid search combining BM25 keyword matching with dense embeddings in Qdrant, fused and passed through a cross-encoder reranker so only genuinely relevant chunks reach the LLM.",
      "Every answer is source-grounded — claims link back to the exact document passages they came from, so engineers can verify instead of trust.",
      "Added a real-time voice agent (STT → agent → TTS, streaming end-to-end over WebSockets) that creates tasks, notes and calendar events hands-free at sub-1-second response latency.",
      "Expanded into a full workspace: a Code Studio for AI-generated code, smart notes with auto-filled templates, and an admin panel with role-based access control and audit logging — the features that turn a demo into a tool a regulated team is allowed to adopt.",
    ],
    diagram: {
      title: "Retrieval pipeline — every answer traceable to its source",
      lanes: [
        {
          title: "Ingest",
          nodes: [
            { label: "Internal documents", sub: "specs · procedures · standards" },
            { label: "Parse + chunk", sub: "structure-aware splitting" },
          ],
        },
        {
          title: "Index",
          nodes: [
            { label: "Dense embeddings", sub: "Qdrant vector store" },
            { label: "BM25 index", sub: "keyword recall" },
          ],
        },
        {
          title: "Retrieve",
          nodes: [
            { label: "Hybrid fusion", sub: "dense + sparse candidates" },
            { label: "Cross-encoder rerank", sub: "precision pass" },
          ],
        },
        {
          title: "Answer",
          nodes: [
            { label: "On-prem LLM", sub: "Ollama, offline" },
            { label: "Grounded answer", sub: "citations to source passages" },
          ],
        },
      ],
    },
    decisions: [
      {
        title: "Hybrid search over pure vector search",
        body: "Engineering documents are full of part numbers, standard IDs and acronyms that dense embeddings blur together. BM25 catches exact identifiers; embeddings catch meaning. Fusing both, then reranking with a cross-encoder, raised answer precision enough that engineers started trusting the tool — which is what adoption actually hinges on.",
      },
      {
        title: "Everything on-premise",
        body: "The network is air-gapped from cloud AI by policy. Inference runs on local GPUs via Ollama, embeddings are computed in-house, and the whole stack deploys with Docker behind Nginx. The constraint shaped the architecture — and proving AI works fully offline became the project's defining feature.",
      },
      {
        title: "Voice as a first-class interface",
        body: "Streaming STT and TTS with careful pipeline overlap keeps perceived latency under a second — the threshold where voice stops feeling like a gimmick and starts being faster than typing.",
      },
    ],
    outcomes: [
      "Adopted by over 50% of the engineering team, with a measured 30%+ efficiency improvement.",
      "Grew from a RAG assistant into the team's default AI workspace — chat, voice, code generation, notes and admin controls.",
      "Owned end-to-end by one engineer: architecture, backend, frontend, deployment and operations.",
    ],
  },
  {
    slug: "testmatrix-ai",
    index: "02",
    org: "GE HealthCare",
    confidential: true,
    title: "TestMatrix AI",
    tagline: "Compliance-grade V&V test generation for medical devices",
    description:
      "Auto-generates IEC 62304 / FDA 21 CFR 820-compliant test cases for medical-device hardware. A layered quality pipeline runs cheap deterministic checks before expensive AI calls — output enters human review ready to approve, not ready to fix.",
    period: "2025 — present",
    role: "Sole engineer — pipeline design, prompt system, validation layers",
    stack: ["Python", "LLM pipeline", "IEC 62304", "FDA 21 CFR 820"],
    metrics: [
      { value: "IEC 62304", label: "compliant output format" },
      { value: "Layered", label: "cheap checks before expensive AI calls" },
      { value: "Review-ready", label: "approve, don't fix" },
    ],
    problem:
      "Verification & validation for medical-device hardware demands exhaustive, precisely formatted test cases under IEC 62304 and FDA 21 CFR 820. Writing them by hand is slow, and naive LLM generation produces output that looks right but fails review — which costs more time than it saves.",
    approach: [
      "Designed a layered quality pipeline: deterministic structural checks, format validators and consistency rules all run before any expensive LLM call, and every generation passes through the same gates on the way out.",
      "Encoded the compliance format into the generation contract itself, so the model is constrained toward valid output rather than corrected after the fact.",
      "Optimized for the true bottleneck — human review time. The goal is output that reviewers approve, not output that reviewers repair.",
    ],
    diagram: {
      title: "Layered quality pipeline — cheap gates before expensive calls",
      lanes: [
        {
          title: "Input",
          nodes: [{ label: "Hardware requirements", sub: "device specs" }],
        },
        {
          title: "Gate 1 · cheap",
          nodes: [
            { label: "Structural checks", sub: "deterministic, instant" },
            { label: "Format validators", sub: "schema + rules" },
          ],
        },
        {
          title: "Gate 2 · expensive",
          nodes: [{ label: "LLM generation", sub: "compliance-constrained" }],
        },
        {
          title: "Output",
          nodes: [
            { label: "Post-validation", sub: "same gates, outbound" },
            { label: "Review-ready test cases", sub: "IEC 62304 / 21 CFR 820" },
          ],
        },
      ],
    },
    decisions: [
      {
        title: "Cheap checks always run first",
        body: "LLM calls are the most expensive and least predictable stage, so everything deterministic — structure, schema, naming, traceability rules — runs before and after them. Bad inputs never reach the model; bad outputs never reach a human.",
      },
      {
        title: "Optimize for review time, not generation time",
        body: "In a regulated process the human reviewer is the scarce resource. A system that generates 10x faster but needs correction loses to one that generates review-ready output every time.",
      },
    ],
    outcomes: [
      "Test cases enter human review ready to approve rather than ready to fix.",
      "Consistent, compliant output format across runs — the property regulated teams actually need from AI tooling.",
    ],
  },
  {
    slug: "atlas-ai",
    index: "03",
    org: "GE HealthCare",
    confidential: true,
    title: "Atlas AI",
    tagline: "Weeks of specification writing, compressed to minutes",
    description:
      "Generates 50+ page DRS/SSRS/SWRS engineering specification documents from a short brief in under 10 minutes — work that previously took engineers weeks. Built on Docling parsing, bge-m3 retrieval and a critic/reviser loop.",
    period: "2025 — present",
    role: "Sole engineer — generation architecture, retrieval, quality loop",
    stack: ["Docling", "bge-m3", "Critic/Reviser loop", "Python"],
    metrics: [
      { value: "50+", label: "pages generated per document" },
      { value: "<10 min", label: "from brief to full draft" },
      { value: "Weeks → minutes", label: "turnaround compression" },
    ],
    problem:
      "DRS, SSRS and SWRS specification documents run 50+ pages of dense, cross-referenced engineering content. Writing one takes an engineer weeks, and long-document generation is exactly where LLMs fail by default — they lose coherence, contradict themselves and drift from source material.",
    approach: [
      "Used Docling to parse reference documents with structure intact — sections, tables and cross-references survive ingestion instead of flattening to text soup.",
      "Retrieval over bge-m3 embeddings grounds every section in real source material as it's generated, section by section, so a 50-page document stays consistent instead of drifting.",
      "A critic/reviser loop reviews each generated section against the brief and the sources, then revises before assembly — quality control built into generation, not bolted on after.",
    ],
    diagram: {
      title: "Section-wise grounded generation with a critic in the loop",
      lanes: [
        {
          title: "Ingest",
          nodes: [
            { label: "Short brief", sub: "the ask" },
            { label: "Docling parsing", sub: "structure-preserving" },
          ],
        },
        {
          title: "Ground",
          nodes: [{ label: "bge-m3 retrieval", sub: "per-section grounding" }],
        },
        {
          title: "Generate",
          nodes: [
            { label: "Section generator", sub: "one section at a time" },
            { label: "Critic / reviser", sub: "review → revise loop" },
          ],
        },
        {
          title: "Assemble",
          nodes: [{ label: "50+ page document", sub: "DRS / SSRS / SWRS, <10 min" }],
        },
      ],
    },
    decisions: [
      {
        title: "Generate section-by-section, grounded per section",
        body: "Asking a model for 50 coherent pages in one shot fails. Generating each section against its own retrieved grounding, under a shared document plan, keeps long-range consistency while staying within what models do reliably.",
      },
      {
        title: "A critic model instead of human spot-checks",
        body: "Every section is reviewed against brief and sources by a critic pass before assembly. It catches drift and contradiction at the point of generation — where it's cheap — instead of in engineering review, where it's expensive.",
      },
    ],
    outcomes: [
      "Full 50+ page specification drafts in under 10 minutes, from a brief that takes minutes to write.",
      "Compressed a weeks-long engineering writing task into a same-morning task.",
    ],
  },
  {
    slug: "luna-ai",
    index: "04",
    org: "Personal",
    confidential: false,
    title: "Luna AI",
    tagline: "A cross-platform AI companion with 500+ users",
    description:
      "AI companion app — chat, voice, journaling and games — unifying Gemini, Claude, Grok and OpenAI behind one interface. React Native + Expo frontend, FastAPI + PostgreSQL backend, shipped to the Play Store solo.",
    period: "2024 — present",
    role: "Solo — full stack, from architecture to Play Store deployment",
    stack: ["React Native", "Expo", "FastAPI", "PostgreSQL", "Multi-provider LLM"],
    metrics: [
      { value: "500+", label: "users post-launch" },
      { value: "4", label: "LLM providers behind one interface" },
      { value: "1", label: "engineer, end to end" },
    ],
    problem:
      "I wanted a real, shipped consumer AI product with actual users — not a demo. That means the unglamorous full stack: auth, persistence, provider failover, app-store review, crash-free releases.",
    approach: [
      "Built a unified conversational layer over Gemini, Claude, Grok and OpenAI, with conversation state and user data persisted in PostgreSQL behind a FastAPI backend.",
      "Implemented chat, voice interaction, journaling, games and personalized companion features in React Native + Expo, sharing one codebase across platforms.",
      "Owned the entire delivery pipeline through Play Store review and release.",
    ],
    diagram: {
      title: "One interface, four model providers",
      lanes: [
        {
          title: "Client",
          nodes: [{ label: "React Native + Expo", sub: "chat · voice · journal" }],
        },
        {
          title: "Backend",
          nodes: [
            { label: "FastAPI", sub: "auth · sessions" },
            { label: "PostgreSQL", sub: "conversation state" },
          ],
        },
        {
          title: "Providers",
          nodes: [
            { label: "Unified LLM layer", sub: "Gemini · Claude · Grok · OpenAI" },
          ],
        },
      ],
    },
    decisions: [
      {
        title: "Provider-agnostic by design",
        body: "A thin abstraction over four LLM APIs meant model choice became a product decision, not a rewrite — and outages in one provider never took the app down.",
      },
    ],
    outcomes: [
      "500+ users after launch, architected, built and shipped by one person.",
      "Live on the Play Store with persistent conversations, voice interaction and journaling.",
    ],
    links: [
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=com.luna.companion&hl=en_IN",
      },
    ],
  },
  {
    slug: "spenzy-ai",
    index: "05",
    org: "Personal",
    confidential: false,
    title: "Spenzy AI",
    tagline: "Natural-language expense tracking in Flutter",
    description:
      "Smart expense tracker with AI-powered financial analysis — spending categorization, budgets and conversational summaries powered by GPT, built in Flutter.",
    period: "2024",
    role: "Solo — design, build, ship",
    stack: ["Flutter", "Dart", "OpenAI API"],
    metrics: [
      { value: "NL", label: "natural-language expense analysis" },
      { value: "Real-time", label: "spending insights" },
    ],
    problem:
      "Expense trackers die because logging is tedious and insights are generic. The bet: natural language in, conversational insight out.",
    approach: [
      "Built expense logging, spending categorization and budget tracking in Flutter with a responsive mobile UI.",
      "Wired GPT into the analysis path for conversational financial summaries and personalized budget recommendations.",
    ],
    diagram: {
      title: "Conversational finance loop",
      lanes: [
        { title: "Input", nodes: [{ label: "Expenses + questions", sub: "natural language" }] },
        { title: "App", nodes: [{ label: "Flutter client", sub: "categorization · budgets" }] },
        { title: "AI", nodes: [{ label: "GPT analysis", sub: "summaries · recommendations" }] },
      ],
    },
    decisions: [
      {
        title: "Conversation as the analytics UI",
        body: "Instead of charts nobody reads, spending insight arrives as answers to questions users actually ask — 'where did my money go this month?'",
      },
    ],
    outcomes: [
      "Shipped cross-platform with real-time spending insights and personalized recommendations.",
    ],
  },
];

/** Serialize everything the agent is allowed to know into one grounding document. */
export function buildAgentContext(): string {
  const p = profile;
  const lines: string[] = [
    `# ${p.name} — ${p.role} at ${p.company}`,
    ``,
    `Location: ${p.location} · Email: ${p.email} · LinkedIn: ${p.linkedin} · GitHub: ${p.github}`,
    ``,
    `## Summary`,
    p.summary,
    ``,
    `## About`,
    ...p.about,
    ``,
    `## Experience`,
    ...p.experience.map(
      (e) => `- ${e.role}, ${e.company}, ${e.location} (${e.period}): ${e.summary}`
    ),
    ``,
    `## Key numbers`,
    ...p.stats.map((s) => `- ${s.value} — ${s.label}`),
    ``,
    `## Projects`,
  ];
  for (const pr of projects) {
    lines.push(
      ``,
      `### ${pr.title} (${pr.org}, ${pr.period}) — ${pr.tagline}`,
      `Role: ${pr.role}`,
      `Stack: ${pr.stack.join(", ")}`,
      `Problem: ${pr.problem}`,
      `Approach: ${pr.approach.join(" ")}`,
      `Key decisions: ${pr.decisions.map((d) => `${d.title} — ${d.body}`).join(" | ")}`,
      `Outcomes: ${pr.outcomes.join(" ")}`,
      `Metrics: ${pr.metrics.map((m) => `${m.value} ${m.label}`).join("; ")}`
    );
  }
  lines.push(
    ``,
    `## Skills`,
    ...p.skills.map((s) => `- ${s.group}: ${s.items}`),
    ``,
    `## Education`,
    ...p.education.map((e) => `- ${e.degree}, ${e.school} (${e.period}) — ${e.note}`),
    ``,
    `## Professional certifications`,
    ...p.certifications.map((c) => `- ${c.name} — ${c.focus}`)
  );
  return lines.join("\n");
}
