import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const IntakeSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("intake_form")),
});

function serviceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) throw new Error("Missing Supabase env vars");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = IntakeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { slug, name, email, phone, event_date, message, source } = parsed.data;

    const supabase = serviceSupabase();

    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("slug", slug)
      .single();

    if (orgErr || !org) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 });
    }

    const { error: leadErr } = await supabase.from("leads").insert({
      org_id: org.id,
      name,
      email: email || null,
      phone: phone || null,
      event_date: event_date || null,
      message: message || null,
      source: source || "intake_form",
      status: "new",
    });

    if (leadErr) {
      return NextResponse.json({ error: leadErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orgName: org.name }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
