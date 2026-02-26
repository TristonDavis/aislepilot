import { Nav } from "@/components/Nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const { data: member } = await supabase
    .from("org_members")
    .select("organizations")
    .limit(1)
    .single();

  const orgId = member?.organizations?.id;

  const { data: org } = await supabase
    .from("organizations")
    .select("name, brand_color")
    .eq("id", orgId)
    .single();

  const brandColor = org?.brand_color ?? "#000000";

  return (
    <div style={{ ["--brand" as any]: brandColor }}>
      <Nav orgName={org?.name ?? "AislePilot"} />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}