'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MenuIcon, MoonIcon, SunIcon, AlignJustify, XIcon, UserCircle2, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useAuthStore } from '@/lib/authStore'

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const { toggleSidebar, open: isSidebarOpen } = useSidebar()
  const isMobile = useIsMobile()

  const { isLoggedIn, user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex h-14 w-full items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-12 w-12 items-center justify-center rounded-none ml-[6px]"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <XIcon className="h-5 w-5" /> : <AlignJustify className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-14 w-14 items-center justify-center rounded-none"
            onClick={toggleSidebar}
            aria-label="Toggle Navigation"
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center space-x-2 pr-4 sm:pr-6 lg:pr-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {isLoggedIn && user ? (
            <>
              <Button variant="ghost" asChild className="px-2 sm:px-3">
                <Link href="/my-page" className="flex items-center">
                  <UserCircle2 className="mr-1 sm:mr-2 h-5 w-5" />
                  <span className="text-sm font-medium truncate max-w-[100px] sm:max-w-[150px]">{user.nickname}</span>
                </Link>
              </Button>
              {isMobile ? (
                <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              ) : (
                <Button variant="outline" onClick={handleLogout} aria-label="Logout" className="px-3">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 