import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getPrivacy } from "@/lib/api";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How K.R Trans Fuels collects, uses and protects your personal information.",
};

// ISR: legal copy changes very rarely — cache for an hour. (Admin edits also
// trigger on-demand revalidation, so changes show up immediately in practice.)
export const revalidate = 3600;

type Section = { id?: string; title?: string; content?: string };

// ─── Inline auto-linking ──────────────────────────────────────────────────────
// Turn bare emails / URLs inside the legal copy into real links without needing
// the admin to author any markup. Links inherit the surrounding text colour so
// the page reads as a plain legal document.
const LINK_TOKEN = /([\w.+-]+@[\w-]+\.[\w.-]+|https?:\/\/[^\s)]+|www\.[^\s)]+)/g;

function linkify(text: string) {
  return text.split(LINK_TOKEN).map((part, i) => {
    if (!part) return null;
    const isEmail = /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(part);
    const isUrl = /^(https?:\/\/|www\.)/.test(part);
    if (isEmail || isUrl) {
      // Peel trailing sentence punctuation so it isn't baked into the href.
      const trail = part.match(/[.,;:)\]]+$/)?.[0] ?? "";
      const token = trail ? part.slice(0, -trail.length) : part;
      const href = isEmail ? `mailto:${token}` : token.startsWith("http") ? token : `https://${token}`;
      return (
        <span key={i}>
          <a
            href={href}
            target={isUrl ? "_blank" : undefined}
            rel={isUrl ? "noopener noreferrer" : undefined}
            className="underline-offset-2 hover:underline"
          >
            {token}
          </a>
          {trail}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Parse a stored content string (paragraphs separated by blank lines, bullets
// prefixed with "•" or "-") into renderable blocks.
type Block = { type: "p"; text: string } | { type: "ul"; items: string[] };

function toBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push({ type: "ul", items: bullets });
      bullets = [];
    }
  };
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("•") || line.startsWith("-")) {
      bullets.push(line.replace(/^[•-]\s*/, ""));
    } else {
      flush();
      blocks.push({ type: "p", text: line });
    }
  }
  flush();
  return blocks;
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="space-y-3 py-1">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-3 pl-1">
                <Check size={17} strokeWidth={3} className="mt-0.5 shrink-0 text-brand" />
                <span>{linkify(it)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className={/^effective date/i.test(b.text) ? "font-semibold" : undefined}>
            {linkify(b.text)}
          </p>
        )
      )}
    </>
  );
}

export default async function PrivacyPage() {
  const policy = await getPrivacy();
  const sections: Section[] = policy?.sections ?? [];

  // The first untitled section is the preamble (effective date + intro); the
  // rest are the titled body sections.
  const leadBlocks = toBlocks(sections.find((s) => !s.title?.trim())?.content ?? "");
  const body = sections.filter((s) => s.title?.trim());

  return (
    <>
      {/* ── Page header — consistent with Contact / Stations / Guide ──────── */}
      <section className="bg-gradient-to-b from-brand-pale/60 to-white">
        <div className="container-x py-14 text-center">
          <span className="eyebrow mb-4">Your Privacy Matters</span>
          <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">
            {policy?.banner?.title || "Privacy Policy"}
          </h1>
          {policy?.banner?.subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-mutedfg">{linkify(policy.banner.subtitle)}</p>
          )}
        </div>
      </section>

      {/* ── Document body — flowing passage, no card boxes ────────────────── */}
      <section className="container-x py-14 sm:py-16">
        <div className="max-w-5xl">
          {sections.length === 0 ? (
            <p className="text-mutedfg">Privacy policy content will appear here.</p>
          ) : (
            <div className="text-[15px] leading-7 text-ink/80 sm:text-base">
              {/* Preamble — effective date + intro, as plain flowing paragraphs */}
              {leadBlocks.length > 0 && <div className="space-y-4">
                <Blocks blocks={leadBlocks} />
              </div>}

              {/* Body sections */}
              {body.map((s, i) => (
                <section key={s.id ?? i} className="mt-9 scroll-mt-24">
                  <h2 className="text-xl font-bold text-ink sm:text-[1.4rem]">{s.title}</h2>
                  <div className="mt-3 space-y-4">
                    <Blocks blocks={toBlocks(s.content ?? "")} />
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
