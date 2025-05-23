"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BadgeIcon } from "@/components/icons/badge-icon/badge-icon"

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerificationSent, setIsVerificationSent] = useState(false)

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev)
  }

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement signup logic
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    } catch (error) {
      console.error("Signup error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendVerification = async () => {
    const emailInput = document.getElementById("email") as HTMLInputElement
    if (!emailInput?.value) {
      emailInput?.focus()
      return
    }

    try {
      setIsVerificationSent(true)
      // TODO: Implement email verification logic
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    } catch (error) {
      console.error("Verification error:", error)
      setIsVerificationSent(false)
    }
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold mb-1">회원가입</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-500 dark:text-pink-600 dark:hover:text-pink-500 transition-colors duration-200"
        >
          로그인
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">닉네임</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <BadgeIcon />
            </div>
            <Input
              id="nickname"
              name="nickname"
              placeholder="닉네임을 입력하세요"
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

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
          <Label htmlFor="email">이메일</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaEnvelope />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="이메일 주소를 입력하세요"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="button"
              onClick={handleSendVerification}
              disabled={isLoading || isVerificationSent}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700"
            >
              {isVerificationSent ? "발송완료" : "인증코드 발송"}
            </Button>
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaLock />
            </div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="비밀번호를 다시 입력하세요"
              className="pl-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={handleToggleConfirmPassword}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700"
          disabled={isLoading}
        >
          {isLoading ? "회원가입 중..." : "회원가입"}
        </Button>
      </form>
    </div>
  )
}
