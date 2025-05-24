'use client'

import { Button } from '@/components/ui/button'
import { Gamepad2, PlusCircle } from 'lucide-react'

interface NoCharactersMessageProps {
  onOpenModalAction: () => void
}

export function NoCharactersMessage ({ onOpenModalAction }: NoCharactersMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 mt-8 sm:mt-10 md:mt-12">
      <Gamepad2 className="w-20 h-20 text-primary mb-5" strokeWidth={1.5} />
      
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
        아직 모험가가 없으시네요!
      </h2>
      
      <p className="max-w-md text-base text-muted-foreground leading-relaxed mb-6">
        RPGPT에 첫 캐릭터를 등록하고,
        던전앤파이터 플레이 경험을 한층 업그레이드하세요!
        상세 정보 조회부터 AI 분석까지, 모든 기능을 편리하게 이용할 수 있습니다.
      </p>
      
      <Button onClick={onOpenModalAction} size="lg" className="text-base px-6 py-3 sm:text-lg sm:px-8 sm:py-3">
        <PlusCircle className="mr-2 h-5 w-5" /> 첫 캐릭터 등록하기
      </Button>
    </div>
  )
} 