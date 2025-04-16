"use client"

import {  Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()



  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Appearance</h3>
          <p className="text-sm text-muted-foreground">Customize how Briza looks and feels.</p>
        </div>

        <Separator />
        <div className="space-y-4">
      <div className="text-sm font-medium">Theme</div>
      <div className="text-sm text-muted-foreground">Select the theme for the dashboard.</div>
      <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
        <div>
          <label className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
            <RadioGroupItem value="light" className="sr-only" />
            <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent">
              <Sun className="h-5 w-5 mb-3" />
              <div className="font-medium">Light</div>
              <div className="text-xs text-muted-foreground">Light mode</div>
            </div>
          </label>
        </div>

        <div>
          <label className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
            <RadioGroupItem value="dark" className="sr-only" />
            <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent">
              <Moon className="h-5 w-5 mb-3" />
              <div className="font-medium">Dark</div>
              <div className="text-xs text-muted-foreground">Dark mode</div>
            </div>
          </label>
        </div>

        <div>
          <label className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
            <RadioGroupItem value="system" className="sr-only" />
            <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent">
              <div className="flex space-x-1 mb-3">
                <Sun className="h-5 w-5" />
                <span className="sr-only">To</span>
                <Moon className="h-5 w-5" />
              </div>
              <div className="font-medium">System</div>
              <div className="text-xs text-muted-foreground">Follow system</div>
            </div>
          </label>
        </div>
      </RadioGroup>
    </div>

      </div>
    </div>
  )
}
