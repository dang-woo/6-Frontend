'use client'

import Image from 'next/image'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TalismansDTO, RuneDTO } from '@/types/dnf'

interface TalismanSectionProps {
  talismans: TalismansDTO[] | null
}

const getItemRarityVariant = (
  rarity: string
): 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined => {
  switch (rarity) {
    case '커먼':
    case '언커먼':
      return 'secondary'
    case '레어':
      return 'default'
    case '유니크':
      return 'default'
    case '에픽':
      return 'destructive'
    case '레전더리':
    case '신화':
    case '태초':
      return 'default'
    default:
      return 'outline'
  }
}

export function TalismanSection ({ talismans }: TalismanSectionProps) {
  if (!talismans || talismans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>탈리스만 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p>장착한 탈리스만이 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {talismans.map((talismanInfo) => {
        if (!talismanInfo.talisman) return null

        const talisman = talismanInfo.talisman
        const runes = talismanInfo.runes

        return (
          <Card key={talisman.itemId} className='overflow-hidden flex flex-col'>
            <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/10'>
              {talisman.itemImage && (
                <div className='relative w-12 h-12 flex-shrink-0'>
                  <Image
                    src={talisman.itemImage}
                    alt={talisman.itemName}
                    fill
                    sizes='48px'
                    className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
                  />
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-base font-semibold truncate' title={talisman.itemName}>
                  {talisman.itemName}
                </CardTitle>
                {/* API 응답에 탈리스만 자체의 등급 정보가 있다면 Badge로 표시합니다. 현재는 유니크로 간주. */}
                <Badge variant={getItemRarityVariant('유니크')} className='mt-1 text-xs'>
                  유니크 탈리스만
                </Badge>
              </div>
            </CardHeader>
            {runes && runes.length > 0 && (
              <CardContent className='p-3 flex-grow'>
                <h4 className='text-sm font-medium text-muted-foreground mb-1.5'>장착 룬:</h4>
                <div className='space-y-2'>
                  {runes.map((rune: RuneDTO) => (
                    <div key={rune.itemId} className='flex items-center gap-2 p-1.5 border rounded-md bg-background/30'>
                      {rune.itemImage && (
                        <div className='relative w-8 h-8 flex-shrink-0'>
                          <Image
                            src={rune.itemImage}
                            alt={rune.itemName}
                            fill
                            sizes='32px'
                            className='rounded-sm object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
                          />
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium truncate' title={rune.itemName}>
                          {rune.itemName}
                        </p>
                        {/* API 응답에 룬의 등급 정보가 있다면 Badge로 표시합니다. 현재는 정보 없음. */}
                        {/* 예: <Badge variant={getItemRarityVariant(rune.itemRarity)} className='text-xs'>{rune.itemRarity}</Badge> */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
} 