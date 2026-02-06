import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // ensure Node runtime (service role safe)

// Validate inbound payload
const IntakeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")), // "YYYY-MM-DD"
  message: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
});

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = IntakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 1) Look up org by slug
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("slug", slug)
      .single();

    if (orgErr || !org) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // 2) Insert lead
    const { name, email, phone, event_date, message, source } = parsed.data;

    const { error: leadErr } = await supabase.from("leads").insert({
      org_id: org.id,
      name,
      email: email || null,
      phone: phone || null,
      event_date: event_date ? event_date : null,
      message: message || null,
      source: source || "intake_form",
      status: "new",
    });

    if (leadErr) {
      return NextResponse.json({ error: leadErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orgName: org.name }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
