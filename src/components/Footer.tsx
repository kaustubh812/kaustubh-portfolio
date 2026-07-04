import { profile } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col items-start justify-between gap-4 py-10 text-sm text-mut sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
        <div className="flex gap-6 font-mono text-xs tracking-[0.15em]">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            GITHUB
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            LINKEDIN
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="transition-colors hover:text-ink"
          >
            EMAIL
          </a>
        </div>
      </div>
    </footer>
  );
}
