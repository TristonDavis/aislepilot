import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const formData = await req.formData();
  const leadId = String(formData.get("lead_id") || "");
  const action = String(formData.get("action") || "");

  if (!leadId || !action) {
    return NextResponse.redirect(new URL("/dashboard/leads", req.url));
  }

  const supabase = await createSupabaseServerClient();

  if (action === "mark_contacted") {
    await supabase.from("leads").update({ status: "contacted" }).eq("id", leadId);
    return NextResponse.redirect(new URL("/dashboard/leads?status=contacted", req.url));
  }

  if (action === "convert") {
    // 1) Fetch lead
    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("org_id", leadId)
      // .select("id, org_id, name, email, phone, event_date, message")
      // .eq("id", leadId)
      .single();

    if (!lead) {
      return NextResponse.redirect(new URL("/dashboard/leads", req.url));
    }

    // 2) Create wedding (minimal v1 conversion)
    const { data: weddingRow } = await supabase
      .from("weddings")
      .insert({
        org_id: lead.org_id,
        couple_name_1: lead.name,     // v1: put lead name in couple_1, refine later
        wedding_date: lead.event_date ?? null,
        status: "lead",
        notes: lead.message ?? null,
      })
      .select("id")
      .single();

    if (weddingRow?.id) {
      // 3) Link lead to wedding + mark qualified
      await supabase
        .from("leads")
        .update({ wedding_id: weddingRow.id, status: "qualified" })
        .eq("id", leadId);
    }

    return NextResponse.redirect(new URL("/weddings", req.url));
  }

  return NextResponse.redirect(new URL("/dashboard/leads", req.url));
}