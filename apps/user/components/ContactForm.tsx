"use client";
import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { EnquirySchema } from "@kr/shared/validators/enquiry.schema";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [hp, setHp] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    if (hp) return; // bot trap — silently ignore

    const parsed = EnquirySchema.safeParse(form);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, (v as string[])?.[0] ?? ""])));
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch(`${BASE}/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Could not send your message. Please try again.");
      }
      setStatus("done");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (e: any) {
      setStatus("error");
      setErrMsg(e.message);
    }
  };

  if (status === "done") {
    return (
      <div className="card-soft flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircle2 className="text-brand" size={44} />
        <h3 className="text-lg font-bold text-ink">Message sent!</h3>
        <p className="text-sm text-ink/60">Thank you — our team will get back to you shortly.</p>
        <button onClick={() => setStatus("idle")} className="btn-outline mt-2">Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-soft space-y-4">
      <h3 className="text-lg font-bold text-ink">Send us a message</h3>
      {/* honeypot */}
      <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      <Field label="Name" name="name" value={form.name} onChange={set("name")} error={errors.name} />
      <Field label="Email" name="email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
      <Field label="Phone" name="phone" value={form.phone} onChange={set("phone")} error={errors.phone} />
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">Message</label>
        <textarea value={form.message} onChange={set("message")} rows={4} className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand" placeholder="How can we help?" />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
      </div>

      {status === "error" && <p className="text-sm text-red-500">{errMsg}</p>}

      <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
        {status === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

function Field({ label, name, value, onChange, error, type = "text" }: { label: string; name: string; value: string; onChange: (e: any) => void; error?: string; type?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink/70">{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
