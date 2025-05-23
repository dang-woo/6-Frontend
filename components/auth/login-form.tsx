"use client"

import { useState } from "react"
import Link from "next/link"
import { FaUser, FaLock } from "react-icons/fa"
import { AuthInput } from "@/components/ui/auth-input"
import { AuthButton } from "@/components/ui/auth-button"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold mb-1">로그인</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="text-blue-600 hover:text-blue-500 dark:text-pink-600 dark:hover:text-pink-500 transition-colors"
        >
          회원가입
        </Link>
      </p>

      <form>
        <AuthInput id="userId" label="아이디" placeholder="아이디를 입력하세요" icon={<FaUser />} className="mb-4" />

        <AuthInput
          id="password"
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          icon={<FaLock />}
          isPassword
          showPassword={showPassword}
          togglePassword={togglePasswordVisibility}
          className="mb-6"
        />

        <AuthButton>로그인</AuthButton>
      </form>
    </div>
  )
}
