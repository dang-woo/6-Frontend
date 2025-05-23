"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FaUser, FaLock } from "react-icons/fa"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/authStore"

// Zod 스키마 정의
const loginFormSchema = z.object({
  userId: z.string().min(1, { message: "아이디를 입력해주세요." }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { setTokens, setUser, isLoading, setIsLoading } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  })

  const handleTogglePassword = () => setShowPassword(prev => !prev)

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const responseBodyText = await response.text()

      let loginResult
      try {
        loginResult = JSON.parse(responseBodyText)
      } catch (e) {
        toast({
          title: "로그인 실패",
          description: "서버 응답을 처리하는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (response.ok && loginResult.success) {
        if (!loginResult.data || !loginResult.data.accessToken || !loginResult.data.refreshToken) {
          toast({
            title: "로그인 실패",
            description: "인증 토큰 정보가 없습니다.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        setTokens(loginResult.data.accessToken, loginResult.data.refreshToken)

        try {
          const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${loginResult.data.accessToken}`,
            },
          })
          const meResult = await meResponse.json()
          if (meResponse.ok && meResult.success) {
            setUser({ userId: meResult.data.id, nickname: meResult.data.nickname })
          } else {
            throw new Error(meResult.message || "사용자 정보를 가져오는데 실패했습니다.")
          }
        } catch (error) {
          toast({
            title: "오류",
            description: error instanceof Error ? error.message : "사용자 정보를 가져오는데 실패했습니다.",
            variant: "destructive",
          })
        }

        toast({
          title: "로그인 성공",
          description: "잠시 후 메인 페이지로 이동합니다.",
        })
        router.push("/")
      } else {
        toast({
          title: "로그인 실패",
          description: loginResult.message || "아이디 또는 비밀번호가 일치하지 않습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "로그인 중 오류 발생",
        description: "서버와의 통신 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="userId">아이디</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaUser />
                    </div>
                    <Input id="userId" placeholder="아이디를 입력하세요" className="pl-10" {...field} disabled={isSubmitting} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">비밀번호</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaLock />
                    </div>
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="비밀번호를 입력하세요" className="pl-10" {...field} disabled={isSubmitting} />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={handleTogglePassword}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
