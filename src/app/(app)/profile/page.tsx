"use client"

import { useAuthStore } from "@/store/auth.store"
import { useLanguageStore } from "@/store/language.store"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LogOut, Mail, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { translate } from "@/lib/i18n"

export default function ProfilePage() {
  const { profile, logout } = useAuthStore()
  const { language, setLanguage } = useLanguageStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value as "en" | "zh-TW")
  }

  return (
    <div className="bg-background -mx-6">
      {/* Top Filter Bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-background border-b border-border px-6 py-2">
        <div className="container mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="-ml-6">
              <h1 className="text-xl font-semibold text-foreground">Profile</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {translate("Manage your account settings", language)}
              </p>
            </div>
            
            {/* Right: Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh-TW">中文繁體</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto pl-4 pr-4 pt-4 pb-10 max-w-[1600px]">
        <div className="space-y-6">
          {/* Account Information Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">
                {translate("Account Information", language)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {translate("Your account details", language)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {translate("Email", language)}
                  </label>
                  <p className="text-sm">{profile?.email || translate("Not available", language)}</p>
                </div>

                <div className="h-px bg-border" />

                {/* Brand Status */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    {translate("Brand Status", language)}
                  </label>
                  <p className="text-sm">
                    {profile?.hasBrand ? (
                      <span className="text-green-600">{translate("Brand configured", language)}</span>
                    ) : (
                      <span className="text-muted-foreground">{translate("No brand configured", language)}</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">{translate("Actions", language)}</CardTitle>
              <p className="text-sm text-muted-foreground">{translate("Account actions", language)}</p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {translate("Logout", language)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
