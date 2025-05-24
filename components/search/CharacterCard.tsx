'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CharacterSearchResult, ServerOption } from '@/types/dnf'

interface CharacterCardProps {
  character: CharacterSearchResult
  serverOptions: ServerOption[] // 서버 이름을 표시하기 위해 필요
}

export function CharacterCard({ character, serverOptions }: CharacterCardProps) {
  const serverLabel = serverOptions.find(s => s.value === character.serverId)?.label || character.serverId

  return (
    <Link href={`/character/${character.serverId}/${character.characterId}`} passHref>
      <Card className="hover:shadow-lg transition-all duration-200 ease-in-out cursor-pointer h-full flex flex-col border hover:border-blue-600 dark:hover:border-pink-600">
        <CardHeader className="p-0 relative aspect-square overflow-hidden rounded-t-md">
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={character.characterName}
              width={180}
              height={180}
              className="object-cover w-full h-full"
              priority={false}
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground rounded-t-md text-xs sm:text-sm">
              이미지 없음
            </div>
          )}
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold truncate" title={character.characterName}>
              {character.characterName}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate" title={character.jobGrowName}>
              Lv.{character.level} {character.jobGrowName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              서버: {serverLabel}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
            명성: {character.fame || '정보 없음'}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
} 