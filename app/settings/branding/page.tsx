import { createSupabaseServerClient } from "@/lib/supabase/server";
import BrandingForm from "./ui";

export default async function BrandingPage() {
  const supabase = await createSupabaseServerClient();

  // pick first org for v1 (later: org switcher)
  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .limit(1)
    .single();

  const orgId = member?.org_id;

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, brand_color, logo_url")
    .eq("id", orgId)
    .single();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Branding</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Update your organization name and brand color.
        </p>
      </div>

      {org ? <BrandingForm org={org} /> : null}
    </div>
  );
}