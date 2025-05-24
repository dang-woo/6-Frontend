'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CreatureDTO, ArtifactDTO } from '@/types/dnf'

interface CreatureSectionProps {
  creatureData: CreatureDTO | null
  characterId?: string
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
      return 'default' // 파란색 계열 기본
    case '유니크':
      return 'default' // 보라색 계열 기본 (Badge 스타일 따라감)
    case '에픽':
      return 'destructive' // 분홍/빨강 계열 (destructive가 유사)
    case '레전더리':
    case '신화':
    case '태초':
      return 'default' // 주황/노랑 계열 (Badge 스타일 따라감, 혹은 커스텀 필요)
    default:
      return 'outline'
  }
}

export function CreatureSection({ creatureData }: CreatureSectionProps) {
  if (!creatureData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>크리쳐 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p>크리쳐 정보가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  // 백엔드 itemImage 우선 사용, 없으면 네오플 API URL 생성
  const creatureImageUrl = creatureData.itemImage ?? (creatureData.itemId ? getNeopleItemImageUrl(creatureData.itemId) : '/images/placeholder.png')

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {/* 크리쳐 기본 정보 카드 */}
      <Card className='overflow-hidden'>
        <CardHeader className='flex flex-row items-center gap-4 p-4 bg-muted/10'>
          <div className='relative w-16 h-16 flex-shrink-0'>
            <Image
              src={creatureImageUrl}
              alt={creatureData.itemName}
              fill
              sizes='64px'
              className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-1 border'
            />
          </div>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-lg font-semibold truncate' title={creatureData.itemName}>
              {creatureData.itemName}
            </CardTitle>
            <Badge
              variant={getItemRarityVariant(creatureData.itemRarity)}
              className='mt-1 text-xs'
            >
              {creatureData.itemRarity}
            </Badge>
          </div>
        </CardHeader>
        {/* 아티팩트 정보는 크리쳐 카드 내부에 표시하지 않고 별도 카드로 분리합니다. */}
      </Card>

      {/* 아티팩트 정보 카드 (여러 개일 수 있음) */}
      {creatureData.artifact && creatureData.artifact.length > 0 && (
        creatureData.artifact.map((artifact: ArtifactDTO, index: number) => (
          <Card key={artifact.itemId || index} className='overflow-hidden'>
            <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/10'>
              {artifact.itemImage && (
                <div className='relative w-12 h-12 flex-shrink-0'>
                  <Image
                    src={artifact.itemImage}
                    alt={artifact.itemName}
                    fill
                    sizes='48px'
                    className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
                  />
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-base font-semibold truncate' title={artifact.itemName}>
                  {artifact.itemName} (아티팩트)
                </CardTitle>
                <Badge
                  variant={getItemRarityVariant(artifact.itemRarity)}
                  className='mt-1 text-xs'
                >
                  {artifact.itemRarity}
                </Badge>
              </div>
            </CardHeader>
            {/* 아티팩트의 세부 내용이 있다면 CardContent에 추가할 수 있습니다. 현재 API 응답에는 없음 */}
          </Card>
        ))
      )}
    </div>
  );
} 