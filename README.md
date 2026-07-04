# kaustubh-portfolio

Personal portfolio of **Kaustubh Watane** — AI/LLM Engineer at GE HealthCare.

**Live: [kaustubh-portfolio-xi.vercel.app](https://kaustubh-portfolio-xi.vercel.app)** · [LinkedIn](https://www.linkedin.com/in/kaustubh-watane-6135b41a3)

## The idea

Most portfolios *describe* skills. This one *demonstrates* them:

- **A scroll-driven 3D story** — scrolling drives a query through a real RAG
  pipeline: documents shatter into chunks, chunks embed into a vector-space
  point cloud, a query pulls its nearest neighbors, and the retrieved chunks
  assemble into the answer. Built with custom GLSL shaders (12,000 GPU
  particles morphing between four position targets).
- **A live portfolio agent** — "Don't read my portfolio. Interrogate it."
  A streaming chat agent grounded exclusively in the résumé and case-study
  content, powered by Llama 3.3 70B on Groq. The same `src/lib/content.ts`
  file renders the pages *and* feeds the agent's context, so the site and
  the AI can never contradict each other.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| 3D | Three.js via React Three Fiber, custom vertex/fragment shaders |
| Motion | GSAP ScrollTrigger + Lenis smooth scroll |
| Styling | Tailwind CSS v4 |
| Agent | Groq API (Llama 3.3 70B), streaming, rate-limited API route |
| Hosting | Vercel |

## Engineering notes

- **Performance**: DPR capped at 1.75, no antialiasing on particle canvases,
  render loops pause when scenes leave the viewport, reduced particle budget
  on mobile.
- **Accessibility**: full `prefers-reduced-motion` support — the 3D story
  degrades to a static four-step explainer; semantic HTML; focus-visible
  styles.
- **SEO**: per-page metadata, generated Open Graph images, sitemap, robots,
  JSON-LD Person schema.
- **Content integrity**: one typed content source (`src/lib/content.ts`)
  drives pages, case studies, the OG image and the agent's grounding context.

## Running locally

```bash
npm install
cp .env.example .env.local   # add your free Groq key from console.groq.com
npm run dev
```

The site works fully without a key — the agent just reports itself offline.

---

Designed and built by Kaustubh Watane, with Claude Code.
