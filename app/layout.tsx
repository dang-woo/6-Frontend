import type React from "react"
import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import "./globals.css"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "RPGPT",
  description: "RPGPT Application",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
          {children}
          </TooltipProvider>
        </NextThemesProvider>
      </body>
    </html>
  )
}
