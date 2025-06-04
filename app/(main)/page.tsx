"use client"

import * as React from 'react'
import { MainSearchForm } from '@/components/search/MainSearchForm'
import { PageTitle } from '@/components/layout/PageTitle'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function MainPage() {
  return (
    <>
      <Alert variant="destructive" className="rounded-none border-t-1 border-l-0 border-r-0">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center gap-2">
          개인정보 보호정책 변경으로 인해 이메일 수집에 대한 동의가 필요합니다.
          <Link 
            href="/signup" 
            className="underline underline-offset-4 font-medium hover:text-destructive-foreground/80"
          >
            회원가입 다시하기
          </Link>
        </AlertDescription>
      </Alert>
      <div className="flex flex-col items-center justify-start flex-grow h-full pt-16 md:pt-24">
        <PageTitle title="RPGPT" />
        <MainSearchForm />
      </div>
    </>
  )
}
