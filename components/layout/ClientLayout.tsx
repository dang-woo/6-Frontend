'use client'

import * as React from 'react'
import Link from 'next/link'
import { HomeIcon, UserCircleIcon, MessageSquareIcon, SettingsIcon } from 'lucide-react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

import { cn } from '@/lib/utils'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from './Header'

interface ClientLayoutProps {
  children: React.ReactNode
}

// 예시 메뉴 아이템 데이터 (실제로는 props로 받거나 상태 관리)
const sidebarMenuItems = [
  { href: '/', label: '홈', icon: HomeIcon, isActive: true }, // isActive는 usePathname 등으로 동적 결정 필요
  { href: '/my-page', label: '마이페이지', icon: UserCircleIcon },
  { href: '/chat', label: '채팅', icon: MessageSquareIcon },
]

const sidebarFooterItems = [
  { href: '/settings', label: '설정', icon: SettingsIcon },
]

export function ClientLayout({ children }: ClientLayoutProps) {
  // Sidebar 기본 열림 상태 (isMobile이 아닐 때)
  // 이 값은 cookie나 localStorage에서 가져와서 초기화할 수 있습니다.
  const [defaultSidebarOpen, setDefaultSidebarOpen] = React.useState(true)

  React.useEffect(() => {
    // 예시: 화면 크기에 따라 기본 사이드바 상태 변경 (실제로는 useIsMobile 같은 hook 사용 권장)
    const handleResize = () => {
      if (window.innerWidth < 768) { // md 브레이크포인트
        setDefaultSidebarOpen(false)
      } else {
        setDefaultSidebarOpen(true)
      }
    }
    handleResize() // 초기 로드 시 실행
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <SidebarProvider defaultOpen={defaultSidebarOpen}>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <div className={cn("flex flex-1 items-start md:grid md:grid-cols-[auto_1fr]")}>
              <Sidebar className="hidden md:flex md:flex-col md:border-r">
                <SidebarContent>
                  <SidebarMenu>
                    {sidebarMenuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <SidebarMenuItem key={item.href}>
                          <Link href={item.href} passHref legacyBehavior>
                            <SidebarMenuButton asChild isActive={item.isActive}>
                              <span className="flex items-center w-full">
                                <Icon className="mr-2 h-5 w-5 flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </span>
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                  <SidebarMenu>
                    {sidebarFooterItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <SidebarMenuItem key={item.href}>
                          <Link href={item.href} passHref legacyBehavior>
                            <SidebarMenuButton asChild>
                              <span className="flex items-center w-full">
                                <Icon className="mr-2 h-5 w-5 flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </span>
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarFooter>
              </Sidebar>
              <main className="container flex-1 py-6 md:py-8"> {/* 메인 컨텐츠 영역 */}
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </NextThemesProvider>
  )
} 