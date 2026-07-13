import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HealthBar } from "@/components/HealthBar";
import { TabNav } from "@/components/TabNav";
import { SyncButton } from "@/components/SyncButton";
import type { Client } from "@/lib/types";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!data) notFound();
  const client = data as Client;

  return (
    <div className="page">
      <div className="page-header">
        <div className="client-header">
          <div className="client-avatar">{client.initial ?? "?"}</div>
          <div>
            <div className="eyebrow">
              <Link href="/clients">Clients</Link>
            </div>
            <h1>{client.name}</h1>
            {client.url && (
              <div className="url">
                <a href={client.url} target="_blank" rel="noreferrer">
                  {client.url}
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="page-actions" style={{ alignItems: "center", gap: 12 }}>
          <HealthBar score={client.health} width={120} large />
          <SyncButton clientId={client.id} />
        </div>
      </div>

      <TabNav clientId={client.id} />
      {children}
    </div>
  );
}
