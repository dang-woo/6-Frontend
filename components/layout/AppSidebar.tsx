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
]

const sidebarFooterItems: SidebarMenuItemConfig[] = [
  { href: '/settings', icon: SettingsIcon, label: '설정' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { open: isSidebarOpen, isMobile, setOpen: setIsSidebarOpen } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }

  const renderMenuItems = (items: SidebarMenuItemConfig[], isSubmenu = false, isFooter = false) => {
    return items.map((item, index) => {
      const isActive = pathname === item.href
      const hasChildren = item.children && item.children.length > 0

      const shouldShowText = (!isMobile && isSidebarOpen) || (isMobile)

      if (isSubmenu) {
        return (
          <SidebarMenuSubItem key={item.href}>
            <SidebarMenuSubButton
              href={item.href}
              isActive={isActive}
              asChild={!hasChildren}
              target={item.target}
              className="h-10"
              onClick={handleLinkClick}
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
            tooltip={!isMobile && !isSidebarOpen ? item.label : undefined}
            className="h-11 p-3"
            onClick={hasChildren ? undefined : handleLinkClick}
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
        "border-r border-border/40 dark:border-neutral-800",
        "fixed top-16 z-30",
        "h-[calc(100vh-4rem)]",
        "overflow-y-auto overflow-x-hidden flex flex-col",
        "transition-all duration-300 ease-in-out",
        isMobile
          ? 'left-0 w-[270px] bg-background shadow-xl transform'
          : (isSidebarOpen ? 'w-[240px]' : 'w-[64px]'),
        isMobile && !isSidebarOpen && '-translate-x-full opacity-0',
        !isMobile && !isSidebarOpen && 'p-0',
      )}
      collapsible={!isMobile ? "icon" : undefined}
    >
      <SidebarContent className={cn(
        "flex-grow p-2 pt-4",
        !isSidebarOpen && !isMobile && "overflow-hidden"
      )}>
        <SidebarMenu>{renderMenuItems(sidebarMenuItems)}</SidebarMenu>
      </SidebarContent>

      <SidebarFooter className={cn(
        "p-2 mt-auto",
        !isSidebarOpen && !isMobile && "overflow-hidden"
      )}>
        <SidebarMenu>{renderMenuItems(sidebarFooterItems, false, true)}</SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
} 