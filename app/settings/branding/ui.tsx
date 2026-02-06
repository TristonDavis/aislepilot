"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function BrandingForm({
  org,
}: {
  org: { id: string; name: string; slug: string; brand_color: string | null; logo_url: string | null };
}) {
  const supabase = createSupabaseBrowserClient();
  const [name, setName] = useState(org.name);
  const [brandColor, setBrandColor] = useState(org.brand_color ?? "#000000");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);

    const { error } = await supabase
      .from("organizations")
      .update({ name, brand_color: brandColor })
      .eq("id", org.id);

    setSaving(false);
    setMsg(error ? error.message : "Saved.");
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-6 space-y-4">
      <label className="block">
        <div className="text-sm text-neutral-700">Business name</div>
        <input
          className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="block">
        <div className="text-sm text-neutral-700">Accent color</div>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="h-10 w-14 rounded border border-neutral-200"
          />
          <input
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="w-40 rounded-md border border-neutral-200 px-3 py-2 text-sm"
          />
          <span
            className="inline-flex items-center rounded-md border border-neutral-200 px-3 py-2 text-sm"
            style={{ background: brandColor, color: "#fff" }}
          >
            Preview
          </span>
        </div>
      </label>

      <button
        onClick={save}
        disabled={saving}
        className="rounded-md border border-black bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save branding"}
      </button>

      {msg ? <p className="text-sm text-neutral-600">{msg}</p> : null}
    </div>
  );
}