/** Canonical site origin, robust across local dev, Vercel previews and production. */
export function siteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL &&
      `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return new URL(c.trim()).origin;
    } catch {
      // fall through to the next candidate
    }
  }
  return "http://localhost:3000";
}
