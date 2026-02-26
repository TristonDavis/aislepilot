import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const orgName = String(body?.orgName ?? "").trim();
    if (!orgName) {
      return NextResponse.json({ error: "orgName is required" }, { status: 400 });
    }

    // Create org
    const baseSlug = slugify(orgName) || "workspace";
    const uniqueSlug = `${baseSlug}-${user.id.slice(0, 6)}`;

    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({
        name: orgName,
        slug: uniqueSlug,
        owner_user_id: user.id,
        brand_color: "#000000",
      })
      .select("id")
      .single();

    if (orgErr || !org) {
      return NextResponse.json({ error: orgErr?.message ?? "Org create failed" }, { status: 500 });
    }

    // Membership
    const { error: memErr } = await supabase.from("org_members").insert({
      org_id: org.id,
      user_id: user.id,
      role: "owner",
    });

    if (memErr) {
      return NextResponse.json({ error: memErr.message }, { status: 500 });
    }

    // Profile: set active org
    const { error: profErr } = await supabase.from("profiles").upsert({
      user_id: user.id,
      active_org_id: org.id,
    });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orgId: org.id }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
