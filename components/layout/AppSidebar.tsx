'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, UserCircleIcon, MessageSquareIcon, SettingsIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'

interface SidebarMenuItemConfig {
  href: string
  icon: React.ElementType
  label: string
  children?: SidebarMenuItemConfig[]
  target?: string
}

const sidebarMenuItems: SidebarMenuItemConfig[] = [
  { href: '/', icon: HomeIcon, label: '홈' },
  { href: '/my-page', icon: UserCircleIcon, label: '마이페이지' },
  { href: '/chat', icon: MessageSquareIcon, label: '채팅' },
]

const sidebarFooterItems: SidebarMenuItemConfig[] = [
  { href: '/settings', icon: SettingsIcon, label: '설정' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { open: isSidebarOpen, isMobile } = useSidebar()

  const renderMenuItems = (items: SidebarMenuItemConfig[], isSubmenu = false, isFooter = false) => {
    return items.map((item, index) => {
      const isActive = pathname === item.href
      const hasChildren = item.children && item.children.length > 0

      const shouldShowText = isMobile || isSidebarOpen

      if (isSubmenu) {
        return (
          <SidebarMenuSubItem key={item.href}>
            <SidebarMenuSubButton
              href={item.href}
              isActive={isActive}
              asChild={!hasChildren}
              target={item.target}
              className="h-10"
            >
              <item.icon className="mr-2 h-5 w-5 flex-shrink-0" />
              {shouldShowText && <span>{item.label}</span>}
            </SidebarMenuSubButton>
            {hasChildren && <SidebarMenuSub>{renderMenuItems(item.children!, true, isFooter)}</SidebarMenuSub>}
          </SidebarMenuSubItem>
        )
      }

      return (
        <SidebarMenuItem 
          key={item.href}
          className={cn(
            { 'border-b border-border/40 dark:border-neutral-800': index < items.length - 1 && !isFooter }
          )}
        >
          <SidebarMenuButton
            isActive={isActive}
            asChild={!hasChildren}
            tooltip={isSidebarOpen ? undefined : item.label}
            className="h-11 p-3"
          >
            {hasChildren ? (
              <span className="flex items-center w-full">
                <item.icon className="mr-2 h-5 w-5 flex-shrink-0" />
                {shouldShowText && <span>{item.label}</span>}
              </span>
            ) : (
              <Link href={item.href} target={item.target} className="flex items-center w-full">
                <item.icon className="mr-2 h-5 w-5 flex-shrink-0" />
                {shouldShowText && <span>{item.label}</span>}
              </Link>
            )}
          </SidebarMenuButton>
          {hasChildren && <SidebarMenuSub>{renderMenuItems(item.children!, true, isFooter)}</SidebarMenuSub>}
        </SidebarMenuItem>
      )
    })
  }

  return (
    <Sidebar
      className={cn(
        "border-r border-border/40 dark:border-neutral-800 transition-all duration-200 ease-in-out",
        isSidebarOpen ? 'w-[240px]' : 'w-16 md:w-16',
        "overflow-y-auto overflow-x-hidden h-full flex flex-col"
      )}
      collapsible="icon"
    >
      <SidebarContent className="flex-grow p-2 pt-4">
        <SidebarMenu>{renderMenuItems(sidebarMenuItems)}</SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 mt-auto">
        <SidebarMenu>{renderMenuItems(sidebarFooterItems, false, true)}</SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
} 