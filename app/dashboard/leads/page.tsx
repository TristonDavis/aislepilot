import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import IntakeLinkCard from "./ui/IntakeLinkCard";

const STATUS = ["new", "contacted", "qualified", "closed"] as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const supabase = await createSupabaseServerClient();
  const status = (searchParams?.status ?? "new") as string;

  const { data: profile } = await supabase
  .from("profiles")
  .select("active_org_id")
  .single();

const activeOrgId = profile?.active_org_id;

const { data: org } = await supabase
  .from("organizations")
  .select("id, name, slug, brand_color")
  .eq("id", activeOrgId)
  .single();


  // Leads
  let query = supabase
    .from("leads")
    .select("id, name, email, phone, event_date, message, source, status, created_at, wedding_id")
    .order("created_at", { ascending: false })
    .limit(100);

  if (STATUS.includes(status as any)) query = query.eq("status", status);

  const { data: leads, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="mt-2 text-sm text-neutral-600">
            New inquiries from your inquiry link.
          </p>
        </div>

        <Link
          href="/settings/branding"
          className="rounded-md border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
        >
          Branding
        </Link>
      </div>

      {/* Inquiry link card */}
      {org?.slug ? (
        <IntakeLinkCard
          orgName={org.name}
          slug={org.slug}
          brandColor={org.brand_color ?? "#000000"}
        />
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS.map((s) => (
          <Link
            key={s}
            href={`/dashboard/leads?status=${s}`}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              s === status
                ? "border-black bg-black text-white"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {s}
          </Link>
        ))}
        <Link
          href="/dashboard/leads"
          className={`rounded-full border px-3 py-1 text-xs transition ${
            !STATUS.includes(status as any)
              ? "border-black bg-black text-white"
              : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          all
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {!leads?.length ? (
        <div className="rounded-lg border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600">
            No leads yet. Share your inquiry link with couples above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((l) => (
            <div key={l.id} className="rounded-lg border border-neutral-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-medium">{l.name}</div>
                  <div className="mt-1 text-sm text-neutral-600">
                    {l.event_date ? `Event: ${l.event_date}` : "Event: TBD"}
                    {l.source ? ` • Source: ${l.source}` : ""}
                  </div>

                  <div className="mt-3 grid gap-1 text-sm text-neutral-700">
                    {l.email ? <div>Email: {l.email}</div> : null}
                    {l.phone ? <div>Phone: {l.phone}</div> : null}
                  </div>

                  {l.message ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-700">
                      {l.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
                    {l.status}
                  </span>

                  <div className="flex gap-2">
                    <form action={`/dashboard/leads/actions`} method="POST">
                      <input type="hidden" name="lead_id" value={l.id} />
                      <input type="hidden" name="action" value="mark_contacted" />
                      <button className="rounded-md border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50">
                        Mark contacted
                      </button>
                    </form>

                    <form action={`/dashboard/leads/actions`} method="POST">
                      <input type="hidden" name="lead_id" value={l.id} />
                      <input type="hidden" name="action" value="convert" />
                      <button className="rounded-md border border-black bg-black px-3 py-2 text-xs text-white hover:opacity-90">
                        Convert → Wedding
                      </button>
                    </form>
                  </div>

                  <div className="text-xs text-neutral-500">
                    {new Date(l.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}