import type { InputHTMLAttributes, ReactNode } from "react"

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  label: string
  showPassword?: boolean
  togglePassword?: () => void
  isPassword?: boolean
}
