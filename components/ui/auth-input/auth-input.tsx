"use client"

import { forwardRef } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AuthInputProps } from "./auth-input.types"

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon, label, id, showPassword, togglePassword, isPassword = false, className, ...props }, ref) => {
    const handleTogglePassword = () => {
      if (togglePassword) {
        togglePassword()
      }
    }

    return (
      <div className={cn("mb-3", className)}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-gray-400 dark:text-gray-400 z-10" style={{ fontSize: "16px" }}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={isPassword ? (showPassword ? "text" : "password") : props.type || "text"}
            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-md pl-10 pr-3 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
            {...props}
          />
          {isPassword && togglePassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer z-10 p-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleTogglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    )
  },
)

AuthInput.displayName = "AuthInput"
