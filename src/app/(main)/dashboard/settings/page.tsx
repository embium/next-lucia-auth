import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import SettingsTable from "./_components/settings";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Settings",
  description: "Manage your settings",
};

export default async function SettingsPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/signin");
  }

  return <SettingsTable user={user} />;
}
