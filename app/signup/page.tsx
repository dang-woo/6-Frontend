import Image from "next/image"
import { SignupForm } from "@/components/auth-forms/signup-form/signup-form"

export default function SignupPage() {
  return (
    <div className="auth-container min-h-screen">
      <div className="flex flex-col justify-center p-6 lg:p-12">
        <div className="lg:hidden text-center mb-8">
          <h2 className="text-3xl font-bold text-primary drop-shadow-lg">RPGPT</h2>
        </div>
        <SignupForm />
      </div>

      <div className="hidden lg:block relative rounded-l-xl overflow-hidden">
        <Image src="/dnf-character.jpg" alt="던전앤파이터 캐릭터" fill style={{ objectFit: "cover" }} priority />
      </div>
    </div>
  )
}
