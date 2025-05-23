'use client' // Or remove if no client-side interactivity is needed, but for theme access, it might be helpful

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">이 페이지를 찾을 수 없습니다.</h2>
        <p className="text-muted-foreground mb-8">
          요청하신 페이지가 존재하지 않거나, 현재 사용할 수 없습니다.
          <br />
          입력하신 주소가 정확한지 다시 한번 확인해주세요.
        </p>
        <Button asChild>
          <Link href="/">메인 페이지로 돌아가기</Link>
        </Button>
      </div>
    </div>
  )
} 