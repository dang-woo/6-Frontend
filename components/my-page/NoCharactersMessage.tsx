'use client'

import * as React from 'react'
import Link from 'next/link'
import { Users, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function NoCharactersMessage() {
  return (
    <section className="flex justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
          <Users className="h-20 w-20 text-muted-foreground mb-6" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            등록된 캐릭터가 없습니다.
          </h2>
          <p className="text-muted-foreground mb-6">
            새로운 캐릭터를 등록하여 모험을 관리해보세요.
          </p>
          <Button size="lg" asChild>
            <Link href="/my-page/add-character"> {/* TODO: 캐릭터 등록 페이지 경로 확인 및 수정 */}
              <PlusCircle className="mr-2 h-5 w-5" />
              캐릭터 등록하러 가기
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
} 