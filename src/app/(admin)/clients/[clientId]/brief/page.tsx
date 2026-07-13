import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BriefEditor } from "@/components/BriefEditor";
import type { Client } from "@/lib/types";

export default async function BriefPage({
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
  if (!data) notFound();
  const client = data as Client;

  return (
    <BriefEditor
      clientId={client.id}
      clientName={client.name}
      initial={client.brief ?? {}}
    />
  );
}
