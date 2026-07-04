import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { profile } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const title = `${profile.name} — ${profile.role}`;
const description =
  "AI/LLM Engineer at GE HealthCare. Production RAG, agentic and voice AI on regulated networks — three systems shipped solo in 10 months. This portfolio answers questions about itself.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: title,
    template: `%s — ${profile.name}`,
  },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: profile.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#08080d",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  worksFor: { "@type": "Organization", name: profile.company },
  email: `mailto:${profile.email}`,
  url: siteUrl(),
  sameAs: [profile.linkedin, profile.github],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressCountry: "IN",
  },
  knowsAbout: [
    "Retrieval-Augmented Generation",
    "Agentic AI",
    "Voice AI",
    "LLM Engineering",
    "Python",
    "TypeScript",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <SmoothScroll />
        <Nav />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
