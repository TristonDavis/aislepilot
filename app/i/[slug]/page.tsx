"use client";

import { use, useMemo, useState } from "react";
import { email, z } from "zod";

const FormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.union([z.string().email("Enter a valid email"), z.literal("")]),
  phone: z.string(),
  event_date: z.string(),
  message: z.string(),
});

type FormState = z.infer<typeof FormSchema>;

export default function IntakePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    event_date: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/i/${slug}`;
  }, [slug]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = FormSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/intake/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: form.name,
          email: form.email,
          phone: form.phone,
          event_date: form.event_date,
          message: form.message,
          source: "share_link",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Submission failed");

      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-2xl font-semibold">Inquiry sent</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Thanks! Your planner will reach out shortly.
          </p>

          <div className="mt-8 rounded-lg border border-neutral-200 p-5">
            <p className="text-sm text-neutral-700">
              If you need to submit another inquiry, refresh this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-xl px-6 py-14">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Wedding planning inquiry</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Fill this out and we’ll get back to you soon.
            </p>
          </div>
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
            {slug}
          </span>
        </div>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <Field
            label="Name"
            value={form.name}
            onChange={(v) => setForm((s) => ({ ...s, name: v }))}
            required
          />
          <Field
            label="Email (optional)"
            value={form.email ?? ""}
            onChange={(v) => setForm((s) => ({ ...s, email: v }))}
          />
          <Field
            label="Phone (optional)"
            value={form.phone ?? ""}
            onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
          />
          <Field
            label="Event date (optional)"
            type="date"
            value={form.event_date ?? ""}
            onChange={(v) => setForm((s) => ({ ...s, event_date: v }))}
          />
          <TextArea
            label="Message (optional)"
            value={form.message ?? ""}
            onChange={(v) => setForm((s) => ({ ...s, message: v }))}
            placeholder="Tell us what you’re looking for…"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md border border-black bg-black px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit inquiry"}
          </button>
        </form>

        <div className="mt-10 rounded-lg border border-neutral-200 p-5">
          <p className="text-sm font-medium">Planner share link</p>
          <p className="mt-1 text-sm text-neutral-600">
            This is what planners will share with couples:
          </p>

          <div className="mt-3 flex items-center gap-2">
            <input
              readOnly
              value={shareUrl || `/i/${slug}`}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(shareUrl || `/i/${slug}`)}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-700">
        {label} {required ? <span className="text-neutral-400">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
      />
    </label>
  );
}

