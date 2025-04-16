"use client"


import { useState } from "react"
// import { usePathname } from "next/navigation"
import { User, Lock, Palette } from "lucide-react"
import { cn } from "@/lib/utils";
import {SessionType} from "@/lib/types";
import {ProfileSettings} from "./profile-settings";
import {AppearanceSettings} from "./appearance-settings";
import {PasswordSettings} from "./password-settings";

interface SettingsLayoutProps {
//   children: React.ReactNode;
  session: SessionType
}

export function SettingsLayout({ session }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      content: <ProfileSettings session={session}/>,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      content: <AppearanceSettings />,
    },
    {
      id: "password",
      label: "Password",
      icon: Lock,
      content: <PasswordSettings />,
    },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-64 shrink-0">
        <nav className="flex flex-col space-y-1 border rounded-lg overflow-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id ? "bg-muted" : "hover:bg-muted/50",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="flex-1">
        <div className="border rounded-lg">{tabs.find((tab) => tab.id === activeTab)?.content}</div>
      </div>
    </div>
  )
}

export default SettingsLayout
