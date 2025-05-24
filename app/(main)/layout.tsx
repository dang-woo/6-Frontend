'use client'

import * as React from 'react'
// Link, usePathname, 아이콘 등은 AppSidebar로 이동
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { HomeIcon, UserCircleIcon, MessageSquareIcon, SettingsIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  SidebarProvider,
  useSidebar, // useSidebar는 LayoutStructure에서 계속 사용
} from '@/components/ui/sidebar'
import { Header } from '@/components/layout/Header'
import { AppSidebar } from '@/components/layout/AppSidebar' // AppSidebar import

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  // SidebarProvider의 defaultOpen 상태는 SidebarProvider 내부 또는 useMediaQuery를 통해 관리될 수 있음
  // 여기서는 SidebarProvider의 기본 동작에 맡기거나, 필요시 props 전달
  return (
    <SidebarProvider defaultOpen={false}>
      <LayoutStructure>{children}</LayoutStructure>
    </SidebarProvider>
  )
}

function LayoutStructure({ children }: { children: React.ReactNode }) {
  const { open: isSidebarOpen } = useSidebar()
  // pathname, sidebarMenuItems, sidebarFooterItems는 AppSidebar로 이동

  return (
    <div className="relative flex min-h-screen flex-col w-full">
      <Header />
      <div className={cn(
        'flex flex-1 overflow-y-auto', // 기본은 flex
        {
          'md:grid': true, // md 이상에서만 grid
          'md:grid-cols-[240px_1fr]': isSidebarOpen, // md 이상, 사이드바 열렸을 때
          'md:grid-cols-[64px_1fr]': !isSidebarOpen, // md 이상, 사이드바 닫혔을 때
        },
        // 'transition-all duration-200 ease-in-out' // 이 트랜지션은 AppSidebar 자체로 이동하는 것이 좋을 수 있음
      )}>
        <AppSidebar />
        <main className="flex flex-col flex-1 px-4 py-6 md:px-6 md:py-8 md:h-full overflow-x-hidden">
           {children}
        </main>
      </div>
    </div>
  )
} 