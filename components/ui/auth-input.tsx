"use client"

import type React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  label: string
  showPassword?: boolean
  togglePassword?: () => void
  isPassword?: boolean
}

export function AuthInput({
  icon,
  label,
  id,
  showPassword,
  togglePassword,
  isPassword = false,
  className,
  ...props
}: AuthInputProps) {
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
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : props.type || "text"}
          className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-md pl-10 pr-3 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-transparent text-sm"
          {...props}
        />
        {isPassword && togglePassword && (
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 cursor-pointer z-10"
            onClick={togglePassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        )}
      </div>
    </div>
  )
}
