import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TrafficPanel } from "@/components/Analytics";
import type { Client } from "@/lib/types";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  const client = data as Client | null;
  const traffic = client?.traffic ?? null;

  if (!traffic) {
    return (
      <div className="card">
        <div className="empty">
          <h3>No analytics yet</h3>
          <p>
            Use <strong>Pull SiteGuru now</strong> above to load this
            client&apos;s traffic (Google Analytics + Search Console).
          </p>
        </div>
      </div>
    );
  }

  return <TrafficPanel traffic={traffic} />;
}
