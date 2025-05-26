import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface LoginRequiredMessageProps {
  title?: string;
  message?: string;
  buttonText?: string;
  loginPageUrl?: string;
}

export function LoginRequiredMessage({
  title = '로그인이 필요한 서비스입니다.',
  message = '마이페이지를 이용하시려면 먼저 로그인해주세요.',
  buttonText = '로그인 하러가기',
  loginPageUrl = '/login'
}: LoginRequiredMessageProps) {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl flex flex-col items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <p className="mb-8 text-muted-foreground">{message}</p>
        <Button asChild>
          <Link href={loginPageUrl}>{buttonText}</Link>
        </Button>
      </div>
    </div>
  );
} 