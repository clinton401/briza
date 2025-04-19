import type { Metadata } from "next"
import { SettingsLayout } from "@/components/settings/settings-layout"
import getServerUser from "@/hooks/get-server-user";
import { notable } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Settings ",
  description: "Manage your Briza account settings and preferences.",
}

export default async function SettingsPage() {
  const session = await getServerUser();
  if(!session) return;
  return (
    <div className="container pb-16 md:pb-8 pt-6 md:pt-8 px-p-half">
      <div className="mb-6">
        <h1 className={`text-xl font-bold tracking-tight  ${notable.className}`}>Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>
      <SettingsLayout session={session}/>
    </div>
  )
}
