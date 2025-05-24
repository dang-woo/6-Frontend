'use client'

import * as React from 'react'
// import Link from 'next/link' // 현재 사용 안함
import { Settings, PlusCircle, XCircle } from 'lucide-react' // Edit3 아이콘 제거, Settings 아이콘 다시 사용

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface MyPageHeaderProps {
  userName: string
  hasAdventurers: boolean
  adventurerGroupName?: string // 모험단 이름은 선택적으로 받도록 수정
  onOpenModalAction: () => void // onOpenModal -> onOpenModalAction
  isEditMode: boolean; // 편집 모드 상태
  onToggleEditModeAction: () => void; // onToggleEditMode -> onToggleEditModeAction
}

export function MyPageHeader({ 
  userName, 
  hasAdventurers, 
  adventurerGroupName, 
  onOpenModalAction,
  isEditMode,
  onToggleEditModeAction
}: MyPageHeaderProps) {
  return (
    <section className="mb-8">
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:min-w-0 break-words ml-1">
          {userName}님의 마이페이지
        </h1>
        <div className="flex items-center space-x-2 flex-shrink-0 self-end mt-2 sm:self-auto sm:mt-0">
          {hasAdventurers && (
            <Button 
              size="icon" 
              variant={isEditMode ? "secondary" : "ghost"}
              aria-label={isEditMode ? "편집 종료" : "캐릭터 관리"}
              onClick={onToggleEditModeAction} // onToggleEditMode -> onToggleEditModeAction
            >
              {isEditMode ? <XCircle className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
            </Button>
          )}
          {!isEditMode && (
            <Button 
              onClick={onOpenModalAction} // onOpenModal -> onOpenModalAction
              className="min-w-max px-4 py-2 text-sm rounded-md 
                         md:px-8 md:py-3 md:text-base"
            >
              <PlusCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" /> 
              새 캐릭터 등록하기
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm text-muted-foreground ml-1 mb-4">
        {hasAdventurers && adventurerGroupName 
          ? `대표 모험단: ${adventurerGroupName}` 
          : '등록된 모험단 없음'}
      </div>
      <Separator />
    </section>
  )
} 