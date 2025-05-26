import Image from "next/image"
import { LoginForm } from "@/components/auth-forms/login-form/login-form"

export default function LoginPage() {
  return (
    <div className="auth-container min-h-screen">
      <div className="flex flex-col justify-center p-6 lg:p-12">
        <LoginForm />
      </div>

      <div className="hidden lg:block relative rounded-l-xl overflow-hidden">
        <Image src="/dnf-character.jpg" alt="던전앤파이터 캐릭터" fill style={{ objectFit: "cover" }} priority />
      </div>
    </div>
  )
}
