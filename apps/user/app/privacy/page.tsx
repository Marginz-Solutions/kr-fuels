import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { getPrivacy } from "@/lib/api";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How K.R Trans Fuels collects, uses and protects your personal information.",
};

// ISR: legal copy changes very rarely — cache for an hour.
export const revalidate = 3600;

export default async function PrivacyPage() {
  const policy = await getPrivacy();
  const sections: Array<{ id?: string; title?: string; content?: string }> = policy?.sections ?? [];

  return (
    <>
      <section className="bg-gradient-to-b from-brand-pale/60 to-white">
        <div className="container-x py-16 text-center">
          <span className="grid mx-auto mb-4 h-12 w-12 place-items-center rounded-xl bg-brand text-white"><Shield size={22} /></span>
          <div className="mb-4 flex justify-center"><span className="eyebrow">Your Privacy Matters</span></div>
          <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">{policy?.banner?.title || "Privacy Policy"}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mutedfg">
            {policy?.banner?.subtitle || "Your privacy is important to us."}
          </p>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {sections.length === 0 ? (
            <p className="text-mutedfg">Privacy policy content will appear here.</p>
          ) : (
            sections.map((s, i) => (
              <div key={s.id ?? i} className="card-soft">
                <h2 className="section-title text-xl sm:text-2xl">{s.title}</h2>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-mutedfg">{s.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
