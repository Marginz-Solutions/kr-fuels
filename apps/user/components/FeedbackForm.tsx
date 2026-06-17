"use client";
import { useState } from "react";
import { Send, CheckCircle2, Loader2, Star } from "lucide-react";
import { FeedbackSchema, FEEDBACK_CATEGORIES } from "@kr/shared/validators/feedback.schema";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

interface StationOption {
  id: string;
  stationName?: string;
  district?: string;
}

// Public station-feedback form. Posts a real `feedbacks` record (rating, category,
// station, safety awareness) to the public POST /api/v1/feedback endpoint, so the
// admin dashboard feedback analytics get a genuine source. Mirrors ContactForm.
export function FeedbackForm({ stations }: { stations: StationOption[] }) {
  const [form, setForm] = useState({ name: "", email: "", phoneNo: "", stationId: "", category: "", message: "" });
  const [rating, setRating] = useState(0);
  const [safetyAwareness, setSafetyAwareness] = useState(false);
  const [hp, setHp] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    if (hp) return; // bot trap — silently ignore

    const parsed = FeedbackSchema.safeParse({ ...form, rating, safetyAwareness });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, (v as string[])?.[0] ?? ""])));
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch(`${BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Could not submit your feedback. Please try again.");
      }
      setStatus("done");
      setForm({ name: "", email: "", phoneNo: "", stationId: "", category: "", message: "" });
      setRating(0);
      setSafetyAwareness(false);
    } catch (e: any) {
      setStatus("error");
      setErrMsg(e.message);
    }
  };

  if (status === "done") {
    return (
      <div className="card-soft flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircle2 className="text-brand" size={44} />
        <h3 className="text-lg font-bold text-ink">Feedback submitted!</h3>
        <p className="text-sm text-ink/60">Thank you for helping us improve — our team reviews every response.</p>
        <button onClick={() => setStatus("idle")} className="btn-outline mt-2">Submit another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-soft space-y-4">
      <h3 className="text-lg font-bold text-ink">Rate your experience</h3>
      {/* honeypot */}
      <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      <Field label="Name" name="fb-name" value={form.name} onChange={set("name")} error={errors.name} />
      <Field label="Email" name="fb-email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
      <Field label="Phone" name="fb-phone" type="tel" value={form.phoneNo} onChange={set("phoneNo")} error={errors.phoneNo} />

      {/* Station */}
      <div>
        <label htmlFor="fb-station" className="mb-1 block text-sm font-medium text-ink/70">Station</label>
        <select id="fb-station" value={form.stationId} onChange={set("stationId")} className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand">
          <option value="">Select a station…</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>{[s.stationName, s.district].filter(Boolean).join(" — ") || s.id}</option>
          ))}
        </select>
        {errors.stationId && <p className="mt-1 text-xs text-red-500">{errors.stationId}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="fb-category" className="mb-1 block text-sm font-medium text-ink/70">Category</label>
        <select id="fb-category" value={form.category} onChange={set("category")} className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand">
          <option value="">Select a category…</option>
          {FEEDBACK_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
      </div>

      {/* Rating */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">Rating</label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`Rate ${i + 1} star${i ? "s" : ""}`} className="p-0.5">
              <Star size={26} className={i < rating ? "fill-amber-400 text-amber-400" : "text-black/20 transition hover:text-amber-300"} />
            </button>
          ))}
          {rating > 0 && <span className="ml-2 text-sm font-medium text-ink/60">{rating}/5</span>}
        </div>
        {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}
      </div>

      {/* Safety awareness */}
      <label className="flex items-start gap-2.5">
        <input type="checkbox" checked={safetyAwareness} onChange={(e) => setSafetyAwareness(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-black/20 text-brand focus:ring-brand" />
        <span className="text-sm text-ink/70">I was informed about Auto LPG safety guidelines during my visit.</span>
      </label>

      {/* Message */}
      <div>
        <label htmlFor="fb-message" className="mb-1 block text-sm font-medium text-ink/70">Message</label>
        <textarea id="fb-message" value={form.message} onChange={set("message")} rows={4} className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand" placeholder="Tell us about your experience…" />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
      </div>

      {status === "error" && <p className="text-sm text-red-500">{errMsg}</p>}

      <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
        {status === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {status === "sending" ? "Submitting…" : "Submit Feedback"}
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
