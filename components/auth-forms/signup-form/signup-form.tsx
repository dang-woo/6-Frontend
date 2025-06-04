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
} from "@/components/ui/input-otp"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

// Zod 스키마 정의
const signupFormSchema = z.object({
  nickname: z.string().min(2, { message: "닉네임은 2자 이상이어야 합니다." }).max(50, { message: "닉네임은 50자 이하이어야 합니다." }),
  userId: z.string().min(4, { message: "아이디는 4자 이상이어야 합니다." }).max(20, { message: "아이디는 20자 이하이어야 합니다." }),
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  password: z.string()
    .min(6, { message: "비밀번호는 6자 이상이어야 합니다." })
    .regex(/[0-9]/, { message: "비밀번호는 숫자를 하나 이상 포함해야 합니다." }),
  passwordConfirm: z.string(),
  privacyConsent: z.boolean().refine(value => value === true, {
    message: "개인정보 수집 및 이용에 동의해야 합니다.",
  }),
}).refine(data => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["passwordConfirm"], // 오류 메시지를 passwordConfirm 필드에 연결
})

// userId 필드만을 위한 별도 스키마 정의
const userIdCheckSchema = z.string().min(4, { message: "아이디는 4자 이상이어야 합니다." }).max(20, { message: "아이디는 20자 이하이어야 합니다." });

type SignupFormValues = z.infer<typeof signupFormSchema>

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// 개인정보처리방침 텍스트 (JSX로 변환하여 사용 편의성 증대)
const PrivacyPolicyText = () => (
  <div className="prose prose-sm dark:prose-invert max-w-none">
    <h2>RPGPT 개인정보처리방침</h2>
    <p><strong>1. 총칙</strong><br />RPGPT(이하 '서비스')는 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며, 관련 법령에 의거한 개인정보처리방침을 정하여 이용자 권익 보호에 최선을 다하고 있습니다.</p>
    <p><strong>2. 수집하는 개인정보의 항목 및 수집 방법</strong><br />가. 수집하는 개인정보의 항목: 필수항목: 이메일 주소<br />나. 개인정보 수집 방법: 회원가입 시 이용자가 직접 입력</p>
    <p><strong>3. 개인정보의 수집 및 이용 목적</strong><br />서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 관련 법령에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.<br />가. 회원 관리: 회원제 서비스 이용에 따른 본인 식별, 중복 가입 방지, 불량회원의 부정 이용 방지와 비인가 사용 방지, 만 14세 미만 아동 확인 시 법정대리인 동의 여부 확인, 분쟁 조정을 위한 기록 보존, 불만처리 등 민원처리, 고지사항 전달</p>
    <p><strong>4. 개인정보의 보유 및 이용 기간</strong><br />서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.<br />- 회원 정보: 회원 탈퇴 시까지<br />다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지 보유합니다.<br />  1) 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지<br />  2) 서비스 이용에 따른 채권·채무관계 잔존 시에는 해당 채권·채무관계 정산 시까지</p>
    <p><strong>5. 개인정보의 제3자 제공에 관한 사항</strong><br />서비스는 정보주체의 개인정보를 제3자에게 제공하지 않습니다.</p>
    <p><strong>6. 개인정보처리의 위탁에 관한 사항</strong><br />서비스는 원활한 개인정보 업무처리를 위하여 개인정보 처리업무를 위탁하고 있지 않습니다. 위탁하는 경우 관련 법령에 따라 본 개인정보처리방침을 통해 공개하겠습니다.</p>
    <p><strong>7. 정보주체와 법정대리인의 권리·의무 및 그 행사방법</strong><br />이용자는 개인정보주체로서 언제든지 개인정보 열람, 정정, 삭제, 처리정지 요구 등의 권리를 행사할 수 있습니다.- 권리 행사는 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며, 서비스는 이에 대해 지체 없이 조치하겠습니다.</p>
    <p><strong>8. 개인정보 자동 수집 장치의 설치·운영 및 그 거부에 관한 사항</strong><br />서비스는 이용자에게 특화된 맞춤 서비스를 제공하기 위해서 이용자들의 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용하지 않습니다.</p>    
    <p><strong>9. 개인정보의 안전성 확보조치</strong><br />서비스는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.<br />- 개인정보의 암호화: 이용자의 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며 중요한 데이터는 파일 및 전송 데이터를 암호화하거나 파일 잠금 기능을 사용하는 등의 별도 보안기능을 사용하고 있습니다.<br />- 해킹 등에 대비한 기술적 대책: 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.</p>
    <p><strong>10. 개인정보 처리방침 변경</strong><br />이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
    <p><strong>부칙</strong><br />본 방침은 [시행일자 예: 2025년 6월 4일]부터 시행됩니다.</p>
  </div>
);

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isVerificationSent, setIsVerificationSent] = React.useState(false)
  const [isEmailVerified, setIsEmailVerified] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [verificationCode, setVerificationCode] = React.useState("")
  const [isVerifyingCode, setIsVerifyingCode] = React.useState(false)
  const [isCheckingUserId, setIsCheckingUserId] = React.useState(false)
  const [isUserIdChecked, setIsUserIdChecked] = React.useState(false);
  const [userIdStatusMessage, setUserIdStatusMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPrivacyPolicyAgreed, setIsPrivacyPolicyAgreed] = React.useState(false); // 개인정보처리방침 동의 상태

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      nickname: "",
      userId: "",
      email: "",
      password: "",
      passwordConfirm: "",
      privacyConsent: false, // 초기값은 false
    },
  })

  const handleTogglePassword = () => setShowPassword(prev => !prev)
  const handleToggleConfirmPassword = () => setShowConfirmPassword(prev => !prev)

  async function onSubmit(data: SignupFormValues) {
    if (!data.privacyConsent) {
      form.setError("privacyConsent", { type: "manual", message: "개인정보 수집 및 이용에 동의해야 합니다." });
      toast({ title: "동의 필요", description: "개인정보 수집 및 이용에 동의해주세요.", variant: "destructive" });
      setIsPrivacyPolicyAgreed(false); // 동의 페이지로 다시 이동 (선택적)
      return;
    }
    if (!isUserIdChecked) {
      toast({ title: "아이디 확인 필요", description: "아이디 중복 확인 버튼을 눌러주세요.", variant: "destructive" });
      form.setError("userId", {type: "manual", message: "아이디 중복 확인을 해주세요."});
      return;
    }
    if (form.formState.errors.userId) {
        const currentUserIdError = form.formState.errors.userId.message;
        toast({ title: "회원가입 불가", description: currentUserIdError || "아이디 문제를 해결해주세요.", variant: "destructive" });
        return;
    }
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
        if (result.message && (result.message.includes("아이디") || result.message.includes("userId"))) {
          form.setError("userId", { type: "manual", message: result.message })
        }
        if (result.message && (result.message.includes("이메일") || result.message.includes("email"))) {
          form.setError("email", { type: "manual", message: result.message })
        }
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

  const handleCheckUserId = async () => {
    const userId = form.getValues("userId");
    const userIdValidation = userIdCheckSchema.safeParse(userId);

    if (!userIdValidation.success) {
      if (userIdValidation.error.issues && userIdValidation.error.issues.length > 0) {
        form.setError("userId", { 
          type: "manual", 
          message: userIdValidation.error.issues[0].message 
        });
      }
      setIsUserIdChecked(false);
      setUserIdStatusMessage(null);
      return;
    }
    
    setIsCheckingUserId(true);
    setUserIdStatusMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-userid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        form.clearErrors("userId");
        setUserIdStatusMessage({ text: result.message, type: 'success' });
        setIsUserIdChecked(true); 
      } else {
        form.setError("userId", { type: "manual", message: result.message || "아이디를 사용할 수 없습니다." });
        setIsUserIdChecked(false);
      }
    } catch (error) {
      const errorMessage = "아이디 확인 중 오류 발생";
      form.setError("userId", { type: "manual", message: errorMessage });
      setIsUserIdChecked(false);
    } finally {
      setIsCheckingUserId(false);
    }
  };

  const handleSendVerification = async () => {
    const email = form.getValues("email")
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.setError("email", { type: "manual", message: "유효한 이메일 주소를 입력해주세요." })
      toast({ title: "이메일 확인", description: "인증 코드를 받을 이메일 주소를 정확히 입력해주세요.", variant: "destructive" })
      return
    }
    form.clearErrors("email")
    
    let verificationActuallySent = false; 
    setIsVerificationSent(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        toast({ title: "인증 코드 발송", description: result.message })
        verificationActuallySent = true;
      } else {
        if (result.message && (result.message.includes("이메일") || result.message.includes("email"))) {
          form.setError("email", { type: "manual", message: result.message })
        }
        toast({ title: "인증 코드 발송 실패", description: result.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "오류", description: "인증 코드 발송 중 오류 발생", variant: "destructive" })
    } finally {
        if (!verificationActuallySent) {
            setIsVerificationSent(false);
        }
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

      if (response.ok) {
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

  // 개인정보처리방침 동의 후 다음 단계로 진행하는 함수
  const handleAgreeAndProceed = () => {
    form.trigger("privacyConsent").then(isValid => {
      if (isValid) {
        setIsPrivacyPolicyAgreed(true);
      } else {
        toast({
          title: "동의 필요",
          description: "개인정보 수집 및 이용에 동의하셔야 회원가입을 진행할 수 있습니다.",
          variant: "destructive",
        });
      }
    });
  };

  if (!isPrivacyPolicyAgreed) {
    return (
      <div className="max-w-md mx-auto w-full">
        <h2 className="text-2xl font-bold mb-4">개인정보처리방침 동의</h2>
        <ScrollArea className="h-72 w-full rounded-md border p-4 mb-4">
          <PrivacyPolicyText />
        </ScrollArea>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <FormField
              control={form.control}
              name="privacyConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-4 p-4 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="privacy-consent-checkbox"
                    />
                  </FormControl>
                  <FormLabel htmlFor="privacy-consent-checkbox" className="font-normal cursor-pointer">
                    위 개인정보처리방침을 모두 확인하였으며, 이에 동의합니다. (필수)
                  </FormLabel>
                </FormItem>
              )}
            />
            <Button
              type="button"
              onClick={handleAgreeAndProceed}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700"
            >
              동의하고 회원가입 계속하기
            </Button>
            <div className="mt-6 text-center text-sm">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 dark:text-pink-600 dark:hover:text-pink-500 transition-colors duration-200"
              >
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </form>
        </Form>
      </div>
    );
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
                <div className="flex gap-2 items-start">
                  <FormControl className="flex-1">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaUser />
                      </div>
                      <Input 
                        id="userId" 
                        placeholder="아이디를 입력하세요" 
                        className="pl-10" 
                        {...field} 
                        disabled={isSubmitting || isCheckingUserId}
                        onChange={(e) => {
                          field.onChange(e);
                          if (isUserIdChecked) setIsUserIdChecked(false);
                          if (form.formState.errors.userId) form.clearErrors("userId");
                          setUserIdStatusMessage(null);
                        }}
                      />
                    </div>
                  </FormControl>
                  <Button
                    type="button"
                    onClick={handleCheckUserId}
                    disabled={isCheckingUserId || !field.value || (form.formState.errors.userId && form.formState.errors.userId.type !== 'manualNotChecked')}
                    className="whitespace-nowrap"
                  >
                    {isCheckingUserId ? "확인 중..." : "중복 확인"}
                  </Button>
                </div>
                {userIdStatusMessage && userIdStatusMessage.type === 'success' && (
                  <p className={`text-sm mt-1 ${userIdStatusMessage.type === 'success' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {userIdStatusMessage.text}
                  </p>
                )}
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
                    {isVerificationSent ? (isEmailVerified ? "인증 완료" : "재전송") : "인증코드 발송"}
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
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
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
                      aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
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
            disabled={isSubmitting || !isEmailVerified || !isUserIdChecked || form.formState.isSubmitting}
          >
            {isSubmitting ? "가입 진행 중..." : "회원가입 완료"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
