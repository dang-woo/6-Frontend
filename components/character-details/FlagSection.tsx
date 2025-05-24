'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FlagDTO, GemDTO, ReinforceStatusDTO } from '@/types/dnf'

interface FlagSectionProps {
  flagData: FlagDTO | null
}

// 네오플 아이템 이미지 URL 생성 함수
const getNeopleItemImageUrl = (itemId: string) => {
  return `https://img-api.neople.co.kr/df/items/${itemId}`
}

const getItemRarityVariant = (rarity: string): 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined => {
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

export function FlagSection({ flagData }: FlagSectionProps) {
  if (!flagData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>휘장 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p>휘장 정보가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  // 백엔드 itemImage 우선 사용, 없으면 네오플 API URL 생성
  const flagImageUrl = flagData.itemImage ?? (flagData.itemId ? getNeopleItemImageUrl(flagData.itemId) : '/images/placeholder.png')

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {/* 휘장 정보 카드 */}
      <Card className='overflow-hidden'>
        <CardHeader className='flex flex-row items-center gap-4 p-4 bg-muted/10'>
          <div className='relative w-16 h-16 flex-shrink-0'>
            <Image
              src={flagImageUrl}
              alt={flagData.itemName}
              fill
              sizes='64px'
              className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-1 border'
            />
          </div>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-lg font-semibold truncate' title={flagData.itemName}>
              {flagData.itemName}
            </CardTitle>
            <div className='flex items-center gap-2 mt-1'>
              <Badge
                variant={getItemRarityVariant(flagData.itemRarity)}
                className='text-xs'
              >
                {flagData.itemRarity}
              </Badge>
              {flagData.reinforce !== 0 && (
                <Badge variant='outline' className='text-xs'>
                  +{flagData.reinforce} 강화
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        {flagData.reinforceStatus && flagData.reinforceStatus.length > 0 && (
          <CardContent className='p-4 pt-2'>
            <h4 className='text-sm font-medium text-muted-foreground mb-1'>강화 효과:</h4>
            <ul className='list-disc list-inside text-xs space-y-0.5 pl-2'>
              {flagData.reinforceStatus.map((status: ReinforceStatusDTO, index: number) => (
                <li key={index} className='text-gray-700 dark:text-gray-300'>
                  {status.name}: <span className='font-semibold'>{status.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* 젬 정보 카드 (여러 개일 수 있음) */}
      {flagData.gems && flagData.gems.length > 0 && (
        flagData.gems.map((gem: GemDTO, index: number) => (
          <Card key={gem.itemId || index} className='overflow-hidden'>
            <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/10'>
              {gem.itemImage && (
                <div className='relative w-12 h-12 flex-shrink-0'>
                  <Image
                    src={gem.itemImage}
                    alt={gem.itemName}
                    fill
                    sizes='48px'
                    className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
                  />
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-base font-semibold truncate' title={gem.itemName}>
                  {gem.itemName} (젬)
                </CardTitle>
                <Badge
                  variant={getItemRarityVariant(gem.itemRarity)}
                  className='mt-1 text-xs'
                >
                  {gem.itemRarity}
                </Badge>
              </div>
            </CardHeader>
            {/* 젬의 세부 내용이 있다면 CardContent에 추가 */}
          </Card>
        ))
      )}
    </div>
  )
} 