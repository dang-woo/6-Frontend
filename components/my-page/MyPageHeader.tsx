'use client'

import * as React from 'react'
import Link from 'next/link'
import { Settings, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface MyPageHeaderProps {
  userName: string
  hasAdventurers: boolean
  adventurerGroupName?: string // 모험단 이름은 선택적으로 받도록 수정
}

export function MyPageHeader({ userName, hasAdventurers, adventurerGroupName }: MyPageHeaderProps) {
  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2 sm:mb-0 min-w-0 break-words ml-4">
          {userName}님이 등록한 모험단 : 
          <span className="md:hidden"><br /></span>
          <span className={hasAdventurers && adventurerGroupName ? 'text-primary' : 'text-muted-foreground'}>
            {hasAdventurers && adventurerGroupName ? adventurerGroupName : '등록된 모험단 없음'}
          </span>
        </h1>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-0 sm:ml-4 mt-2 sm:mt-0">
          <Button size="icon" aria-label="모험단 설정">
            <Settings className="h-5 w-5" />
          </Button>
          <Button asChild>
            <Link href="/my-page/add-character"> {/* TODO: 캐릭터 등록 페이지 경로 확인 및 수정 */}
              <PlusCircle className="mr-2 h-4 w-4" />
              새 캐릭터 등록하기
            </Link>
          </Button>
        </div>
      </div>
      <Separator />
    </section>
  )
} 