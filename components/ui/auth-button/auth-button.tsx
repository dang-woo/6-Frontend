import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import type { AuthButtonProps } from "./auth-button.types"

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="submit"
      className={cn(
        "w-full bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
})

AuthButton.displayName = "AuthButton"
