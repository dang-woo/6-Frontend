'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CreatureDTO, ArtifactDTO } from '@/types/dnf'
import { useEffect, useState } from 'react'

interface CreatureSectionProps {
  creatureData: CreatureDTO | null
  characterId?: string
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

// 새로운 아이템 이미지 URL 가져오는 함수
async function fetchItemImageUrlFromProxy(itemId: string): Promise<string | null> {
  if (!itemId) return null
  try {
    const response = await fetch(`/api/neople/item-image/${itemId}`)
    if (!response.ok) {
      console.error(`Failed to fetch image URL for item ${itemId}: ${response.statusText}`)
      const errorData = await response.json()
      console.error('Error data:', errorData)
      return null
    }
    const data = await response.json()
    return data.imageUrl || null
  } catch (error) {
    console.error(`Error fetching image URL for item ${itemId}:`, error)
    return null
  }
}

export function CreatureSection({ creatureData }: CreatureSectionProps) {
  const [creatureImageUrl, setCreatureImageUrl] = useState<string>('/images/placeholder.png')
  const [artifactImageUrls, setArtifactImageUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (creatureData?.itemId) {
      if (creatureData.itemImage) {
        // 백엔드 제공 URL을 우선 사용합니다.
        // 이 URL이 유효하지 않은 경우를 대비한 추가 로직은 현재 없습니다.
        // 필요하다면 이미지 onError 이벤트를 사용하여 프록시 호출을 트리거할 수 있습니다.
        setCreatureImageUrl(creatureData.itemImage)
      } else {
        // 백엔드 제공 URL이 없으면 프록시를 통해 가져옵니다.
        fetchItemImageUrlFromProxy(creatureData.itemId).then(url => {
          if (url) setCreatureImageUrl(url)
          else setCreatureImageUrl('/images/placeholder.png') // 실패 시 플레이스홀더
        })
      }
    }

    if (creatureData?.artifact) {
      const fetchPromises = creatureData.artifact.map(async (art) => {
        if (art.itemId) {
          let finalUrl = '/images/placeholder.png'
          if (art.itemImage) {
            finalUrl = art.itemImage // 백엔드 URL 우선
          } else {
            const proxyUrl = await fetchItemImageUrlFromProxy(art.itemId)
            if (proxyUrl) finalUrl = proxyUrl
          }
          return { itemId: art.itemId, url: finalUrl }
        }
        return { itemId: art.itemId, url: '/images/placeholder.png' } // itemId가 없는 경우도 고려
      })

      Promise.all(fetchPromises).then(results => {
        const urls: Record<string, string> = {}
        results.forEach(r => {
          if (r.itemId && r.url) {
            urls[r.itemId] = r.url
          }
        })
        setArtifactImageUrls(urls)
      })
    }
  }, [creatureData])

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

  return (
    <div className='flex flex-col gap-4'>
      {/* 크리쳐 기본 정보 카드 - 항상 한 줄 전체 차지 */}
      <Card className='overflow-hidden w-full'>
        <CardHeader className='flex flex-row items-center gap-4 p-4 bg-muted/10'>
          <div className='relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0'> {/* 이미지 크기 살짝 키움 */}
            <Image
              src={creatureImageUrl}
              alt={creatureData.itemName}
              fill
              sizes='(max-width: 768px) 80px, 96px' // 반응형 sizes
              className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-1 border'
              onError={() => {
                if (creatureData.itemImage && creatureData.itemId && creatureImageUrl !== '/images/placeholder.png') {
                  fetchItemImageUrlFromProxy(creatureData.itemId).then(url => {
                    if (url) setCreatureImageUrl(url)
                    else setCreatureImageUrl('/images/placeholder.png')
                  })
                }
              }}
            />
          </div>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-xl md:text-2xl font-semibold truncate' title={creatureData.itemName}>
              {creatureData.itemName}
            </CardTitle>
            <Badge
              variant={getItemRarityVariant(creatureData.itemRarity)}
              className='mt-1 text-sm md:text-base' // 텍스트 크기 반응형
            >
              {creatureData.itemRarity}
            </Badge>
            {/* 크리쳐의 상세 스탯이나 설명 등을 여기에 추가할 수 있습니다. */}
            {/* 예: creatureData.detail?.options 등 */}
          </div>
        </CardHeader>
        {/* 크리쳐 카드에는 CardContent가 필요하다면 추가 */}
      </Card>

      {/* 아티팩트 정보 섹션 제목 (선택 사항) */}
      {creatureData.artifact && creatureData.artifact.length > 0 && (
        <h3 className="text-xl font-semibold tracking-tight mt-2 mb-2">아티팩트</h3>
      )}
      
      {/* 아티팩트 정보 카드들을 담는 그리드 컨테이너 */}
      {creatureData.artifact && creatureData.artifact.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {creatureData.artifact.map((artifact: ArtifactDTO, index: number) => {
            const artifactDefaultImgSrc = artifact.itemImage || '/images/placeholder.png'
            const artifactImgToDisplay = artifact.itemId ? (artifactImageUrls[artifact.itemId] || artifactDefaultImgSrc) : artifactDefaultImgSrc

            return (
              <Card key={artifact.itemId || index} className='overflow-hidden flex flex-col'> {/* flex-col 추가 */} 
                <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/20'> {/* 배경색 살짝 변경 */}
                  {artifact.itemId && (
                    <div className='relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0'> {/* 아티팩트 이미지 크기 조정 */}
                      <Image
                        src={artifactImgToDisplay} 
                        alt={artifact.itemName}
                        fill
                        sizes='(max-width: 768px) 40px, 48px'
                        className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
                        onError={() => {
                          if (artifact.itemImage && artifact.itemId && artifactImageUrls[artifact.itemId] !== '/images/placeholder.png') {
                            fetchItemImageUrlFromProxy(artifact.itemId).then(url => {
                              if (url) {
                                setArtifactImageUrls(prev => ({ ...prev, [artifact.itemId!]: url }))
                              } else {
                                setArtifactImageUrls(prev => ({ ...prev, [artifact.itemId!]: '/images/placeholder.png' }))
                              }
                            })
                          }
                        }}
                      />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold truncate' title={artifact.itemName}> {/* CardTitle 대신 p 태그로 변경 */} 
                      {artifact.itemName}
                    </p>
                    <Badge
                      variant={getItemRarityVariant(artifact.itemRarity)}
                      className='mt-0.5 text-xs'
                    >
                      {artifact.itemRarity}
                    </Badge>
                  </div>
                </CardHeader>
                {/* 아티팩트에 CardContent가 필요하다면 여기에 추가 */}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
} 