"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BadgeIcon } from "@/components/icons/badge-icon/badge-icon"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"

// Zod 스키마 정의
const signupFormSchema = z.object({
  nickname: z.string().min(2, { message: "닉네임은 2자 이상이어야 합니다." }).max(50, { message: "닉네임은 50자 이하이어야 합니다." }),
  userId: z.string().min(4, { message: "아이디는 4자 이상이어야 합니다." }).max(20, { message: "아이디는 20자 이하이어야 합니다." }),
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  password: z.string()
    .min(8, { message: "비밀번호는 8자 이상이어야 합니다." })
    .regex(/[0-9]/, { message: "비밀번호는 숫자를 하나 이상 포함해야 합니다." }),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["passwordConfirm"], // 오류 메시지를 passwordConfirm 필드에 연결
})

type SignupFormValues = z.infer<typeof signupFormSchema>

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isVerificationSent, setIsVerificationSent] = React.useState(false)
  const [isEmailVerified, setIsEmailVerified] = React.useState(false) // 이메일 인증 완료 상태
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [verificationCode, setVerificationCode] = React.useState("")
  const [isVerifyingCode, setIsVerifyingCode] = React.useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      nickname: "",
      userId: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  })

  const handleTogglePassword = () => setShowPassword(prev => !prev)
  const handleToggleConfirmPassword = () => setShowConfirmPassword(prev => !prev)

  async function onSubmit(data: SignupFormValues) {
    if (!isEmailVerified) {
      toast({
        title: "이메일 인증 필요",
        description: "회원가입을 계속하려면 이메일 인증을 완료해주세요.",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: data.userId,
          email: data.email,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
          nickname: data.nickname,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "회원가입 성공",
          description: result.message || "로그인 페이지로 이동합니다.",
        })
        router.push("/login")
      } else {
        toast({
          title: "회원가입 실패",
          description: result.message || "입력 정보를 다시 확인해주세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "오류 발생",
        description: "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendVerification = async () => {
    const email = form.getValues("email")
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.setError("email", { type: "manual", message: "유효한 이메일 주소를 입력해주세요." })
      toast({ title: "이메일 확인", description: "인증 코드를 받을 이메일 주소를 정확히 입력해주세요.", variant: "destructive" })
      return
    }
    form.clearErrors("email") // 이전 오류 메시지 제거
    
    try {
      setIsVerificationSent(true) // 버튼 비활성화를 위해 우선 true로
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        toast({ title: "인증 코드 발송", description: result.message })
        // isVerificationSent는 여기서 관리하지 않고, 인증 코드 입력 UI가 나타나게 함
      } else {
        toast({ title: "인증 코드 발송 실패", description: result.message, variant: "destructive" })
        setIsVerificationSent(false) // 실패 시 다시 보낼 수 있도록
      }
    } catch (error) {
      toast({ title: "오류", description: "인증 코드 발송 중 오류 발생", variant: "destructive" })
      setIsVerificationSent(false)
    }
  }
  
  const handleVerifyEmailCode = async () => {
    const email = form.getValues("email")
    if (verificationCode.length !== 6) {
      toast({ title: "인증 코드 오류", description: "6자리 인증 코드를 입력해주세요.", variant: "destructive" })
      return
    }
    setIsVerifyingCode(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode }),
      })

      // 응답 본문이 있는지 확인하고 JSON 파싱 시도
      const responseBody = await response.text();
      let result = null;
      if (responseBody) {
        try {
          result = JSON.parse(responseBody);
        } catch (e) {
          console.error("JSON parsing error:", e);
          toast({ title: "응답 오류", description: "서버 응답을 처리할 수 없습니다.", variant: "destructive" })
          setIsVerifyingCode(false)
          return;
        }
      }

      if (response.ok) { // 200-299 상태 코드
        setIsEmailVerified(true)
        toast({ title: "이메일 인증 성공", description: result?.message || "이메일이 성공적으로 인증되었습니다." })
      } else {
        toast({ title: "인증 실패", description: result?.message || "인증 코드가 올바르지 않거나 만료되었습니다.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Email verification error:", error)
      toast({ title: "오류", description: "이메일 인증 중 오류가 발생했습니다.", variant: "destructive" })
    } finally {
      setIsVerifyingCode(false)
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="nickname">닉네임</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <BadgeIcon />
                    </div>
                    <Input id="nickname" placeholder="닉네임을 입력하세요" className="pl-10" {...field} disabled={isSubmitting} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">이메일</FormLabel>
                <div className="flex gap-2 items-start">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaEnvelope />
                    </div>
                    <Input id="email" type="email" placeholder="이메일 주소를 입력하세요" className="pl-10" {...field} disabled={isSubmitting || isEmailVerified || isVerificationSent} />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={isSubmitting || isVerificationSent || isEmailVerified}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700 whitespace-nowrap"
                  >
                    {isVerificationSent && !isEmailVerified ? "재전송" : (isEmailVerified ? "인증완료" : "인증코드 발송")}
                  </Button>
                </div>
                {isVerificationSent && !isEmailVerified && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      입력하신 이메일로 6자리 인증 코드가 발송되었습니다.
                    </p>
                    <div className="flex gap-2 items-center">
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={(value) => setVerificationCode(value)}
                        disabled={isVerifyingCode || isEmailVerified}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button
                        type="button"
                        onClick={handleVerifyEmailCode}
                        disabled={isVerifyingCode || isEmailVerified || verificationCode.length !== 6}
                        className="whitespace-nowrap"
                      >
                        {isVerifyingCode ? "확인 중..." : "인증코드 확인"}
                      </Button>
                    </div>
                  </div>
                )}
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

          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="passwordConfirm">비밀번호 확인</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaLock />
                    </div>
                    <Input id="passwordConfirm" type={showConfirmPassword ? "text" : "password"} placeholder="비밀번호를 다시 입력하세요" className="pl-10" {...field} disabled={isSubmitting} />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={handleToggleConfirmPassword}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            disabled={isSubmitting || !isEmailVerified}
          >
            {isSubmitting ? "회원가입 중..." : "회원가입"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
