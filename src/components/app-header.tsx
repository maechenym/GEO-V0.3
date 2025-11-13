"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { Logo } from "@/components/logo"

/**
 * 应用顶部导航栏
 * 
 * 导航交互逻辑：
 * - Logo 点击 → /overview
 * - 用户头像点击 → 打开下拉菜单
 *   - Profile → /profile
 *   - Logout → 调用 logout() → /login（由 useAuth hook 处理）
 */
export function AppHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Logo - 点击返回 /overview */}
      <Link
        href="/overview"
        className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1 -mt-1"
      >
        <Logo size={28} showText={true} textSize="3xl" />
      </Link>

      <div className="flex items-center space-x-4">
        {/* 用户菜单下拉框 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="User menu">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Profile 链接 */}
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex w-full items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Logout - 由 useAuth hook 处理跳转到 /login */}
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

