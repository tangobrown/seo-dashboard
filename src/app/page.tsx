import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";

export default async function Home() {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");
  if (profile?.role === "admin") redirect("/clients");
  redirect("/portal");
}
