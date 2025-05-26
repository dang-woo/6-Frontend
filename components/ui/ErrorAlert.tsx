import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

interface ErrorAlertProps {
  title: string;
  description: string;
  variant?: "default" | "destructive" | null | undefined;
  className?: string;
}

export function ErrorAlert({ 
  title = '오류 발생',
  description = '요청을 처리하는 중 문제가 발생했습니다.',
  variant = 'destructive',
  className = ''
}: ErrorAlertProps) {
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <Alert variant={variant} className="max-w-2xl mx-auto">
        <Terminal className="h-5 w-5" />
        <AlertTitle className="text-lg">{title}</AlertTitle>
        <AlertDescription>
          {description}
        </AlertDescription>
      </Alert>
    </div>
  );
} 