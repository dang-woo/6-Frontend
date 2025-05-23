"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { FaUser, FaLock } from "react-icons/fa"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement login logic
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold mb-1">로그인</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="text-blue-600 hover:text-blue-500 dark:text-pink-600 dark:hover:text-pink-500 transition-colors duration-200"
        >
          회원가입
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">아이디</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaUser />
            </div>
            <Input
              id="userId"
              name="userId"
              placeholder="아이디를 입력하세요"
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaLock />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              className="pl-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={handleTogglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700"
          disabled={isLoading}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </div>
  )
}
