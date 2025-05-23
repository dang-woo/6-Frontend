import type React from "react"
import { cn } from "@/lib/utils"

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function AuthButton({ children, className, ...props }: AuthButtonProps) {
  return (
    <button
      type="submit"
      className={cn(
        "w-full bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
