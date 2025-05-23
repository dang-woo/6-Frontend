'use client'

import * as React from 'react'
import Link from 'next/link'
import { MenuIcon, MoonIcon, SunIcon, AlignJustify, XIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { setTheme, theme } = useTheme()
  const { toggleSidebar, open: isSidebarOpen } = useSidebar()
  const isMobile = useIsMobile()

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
          <Button variant="outline" asChild>
            <Link href="/login">로그인</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">회원가입</Link>
          </Button>
        </div>
      </div>
    </header>
  )
} 