"use client"

import { useState } from "react"
import Link from "next/link"
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa"
import { AuthInput } from "@/components/ui/auth-input"
import { AuthButton } from "@/components/ui/auth-button"
import { BadgeIcon } from "@/components/icons/badge-icon"

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold mb-1">회원가입</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-500 dark:text-pink-600 dark:hover:text-pink-500 transition-colors"
        >
          로그인
        </Link>
      </p>

      <form>
        <AuthInput id="nickname" label="닉네임" placeholder="닉네임을 입력하세요" icon={<BadgeIcon />} />

        <AuthInput id="userId" label="아이디" placeholder="아이디를 입력하세요" icon={<FaUser />} />

        <div className="mb-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
            이메일
          </label>
          <div className="flex gap-2">
            <div className="relative flex items-center flex-1">
              <span className="absolute left-3 text-gray-400 dark:text-gray-400 z-10" style={{ fontSize: "16px" }}>
                <FaEnvelope />
              </span>
              <input
                id="email"
                type="email"
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-md pl-10 pr-3 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="이메일 주소를 입력하세요"
              />
            </div>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700 text-white px-3 py-2 rounded-md whitespace-nowrap text-sm"
            >
              인증코드 발송
            </button>
          </div>
        </div>

        <AuthInput
          id="password"
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          icon={<FaLock />}
          isPassword
          showPassword={showPassword}
          togglePassword={togglePasswordVisibility}
        />

        <AuthInput
          id="confirmPassword"
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 입력하세요"
          icon={<FaLock />}
          isPassword
          showPassword={showConfirmPassword}
          togglePassword={toggleConfirmPasswordVisibility}
          className="mb-4"
        />

        <AuthButton>회원가입</AuthButton>
      </form>
    </div>
  )
}
