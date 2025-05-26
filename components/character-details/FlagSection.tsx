'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FlagDTO, GemDTO, ReinforceStatusDTO } from '@/types/dnf'
import { useEffect, useState } from 'react'

interface FlagSectionProps {
  flagData: FlagDTO | null
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

// 아이템 이미지 URL 가져오는 함수 (CreatureSection.tsx와 동일한 함수 사용 가능하나, 여기서는 중복 정의)
// 실제 프로젝트에서는 이 함수를 공통 유틸리티로 분리하는 것이 좋습니다.
async function fetchItemImageUrlFromProxy(itemId: string): Promise<string | null> {
  if (!itemId) return null
  try {
    const response = await fetch(`/api/neople/item-image/${itemId}`)
    if (!response.ok) {
      console.error(`Failed to fetch image URL for item ${itemId}: ${response.statusText}`)
      const errorData = await response.json()
      console.error('Error data from proxy:', errorData)
      return null
    }
    const data = await response.json()
    return data.imageUrl || null
  } catch (error) {
    console.error(`Error fetching image URL for item ${itemId} via proxy:`, error)
    return null
  }
}

export function FlagSection({ flagData }: FlagSectionProps) {
  const [flagImageUrl, setFlagImageUrl] = useState<string>('/images/placeholder.png')
  const [gemImageUrls, setGemImageUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (flagData?.itemId) {
      if (flagData.itemImage) {
        setFlagImageUrl(flagData.itemImage)
      } else {
        fetchItemImageUrlFromProxy(flagData.itemId).then(url => {
          if (url) setFlagImageUrl(url)
          else setFlagImageUrl('/images/placeholder.png')
        })
      }
    }

    if (flagData?.gems) {
      const fetchPromises = flagData.gems.map(async (gem) => {
        if (gem.itemId) {
          let finalUrl = '/images/placeholder.png'
          if (gem.itemImage) {
            finalUrl = gem.itemImage
          } else {
            const proxyUrl = await fetchItemImageUrlFromProxy(gem.itemId)
            if (proxyUrl) finalUrl = proxyUrl
          }
          return { itemId: gem.itemId, url: finalUrl }
        }
        return { itemId: gem.itemId, url: '/images/placeholder.png' } // itemId가 없는 경우
      })

      Promise.all(fetchPromises).then(results => {
        const urls: Record<string, string> = {}
        results.forEach(r => {
          if (r.itemId && r.url) {
            urls[r.itemId] = r.url
          }
        })
        setGemImageUrls(urls)
      })
    }
  }, [flagData])

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

  return (
    <div className='flex flex-col gap-4'>
      {/* 휘장 정보 카드 - 항상 한 줄 전체 차지 */}
      <Card className='overflow-hidden w-full'>
        <CardHeader className='flex flex-row items-center gap-4 p-4 bg-muted/10'>
          <div className='relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0'> {/* 이미지 크기 살짝 키움 */}
            <Image
              src={flagImageUrl}
              alt={flagData.itemName}
              fill
              sizes='(max-width: 768px) 80px, 96px' // 반응형 sizes
              className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-1 border'
              onError={() => {
                if (flagData.itemImage && flagData.itemId && flagImageUrl !== '/images/placeholder.png') {
                  fetchItemImageUrlFromProxy(flagData.itemId).then(url => {
                    if (url) setFlagImageUrl(url)
                    else setFlagImageUrl('/images/placeholder.png')
                  })
                }
              }}
            />
          </div>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-xl md:text-2xl font-semibold truncate' title={flagData.itemName}>
              {flagData.itemName}
            </CardTitle>
            <div className='flex items-center gap-2 mt-1'>
              <Badge
                variant={getItemRarityVariant(flagData.itemRarity)}
                className='text-sm md:text-base' // 텍스트 크기 반응형
              >
                {flagData.itemRarity}
              </Badge>
              {flagData.reinforce !== 0 && (
                <Badge variant='outline' className='text-sm md:text-base'>
                  +{flagData.reinforce} 강화
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        {flagData.reinforceStatus && flagData.reinforceStatus.length > 0 && (
          <CardContent className='p-4 pt-2'>
            <h4 className='text-base font-medium text-muted-foreground mb-1.5'>강화 효과:</h4>
            <ul className='list-disc list-inside text-sm space-y-0.5 pl-3'>
              {flagData.reinforceStatus.map((status: ReinforceStatusDTO, index: number) => (
                <li key={index} className='text-gray-700 dark:text-gray-300'>
                  {status.name}: <span className='font-semibold'>{status.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* 젬 정보 섹션 제목 */}
      {flagData.gems && flagData.gems.length > 0 && (
         <h3 className="text-xl font-semibold tracking-tight mt-2 mb-2">장착 젬</h3>
      )}

      {/* 젬 정보 카드들을 담는 그리드 컨테이너 */}
      {flagData.gems && flagData.gems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {flagData.gems.map((gem: GemDTO, index: number) => {
            const gemDefaultImgSrc = gem.itemImage || '/images/placeholder.png'
            const gemImgToDisplay = gem.itemId ? (gemImageUrls[gem.itemId] || gemDefaultImgSrc) : gemDefaultImgSrc
            
            return (
              <Card key={gem.itemId || index} className='overflow-hidden flex flex-col'>
                <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/20'>
                  {gem.itemId && (
                    <div className='relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0'> {/* 젬 이미지 크기 조정 */}
                      <Image
                        src={gemImgToDisplay}
                        alt={gem.itemName}
                        fill
                        sizes='(max-width: 768px) 40px, 48px'
                        className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
                        onError={() => {
                          if (gem.itemImage && gem.itemId && gemImageUrls[gem.itemId] !== '/images/placeholder.png') {
                            fetchItemImageUrlFromProxy(gem.itemId).then(url => {
                              if (url) {
                                setGemImageUrls(prev => ({ ...prev, [gem.itemId!]: url }))
                              } else {
                                setGemImageUrls(prev => ({ ...prev, [gem.itemId!]: '/images/placeholder.png' }))
                              }
                            })
                          }
                        }}
                      />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold truncate' title={gem.itemName}>
                      {gem.itemName}
                    </p>
                    <Badge
                      variant={getItemRarityVariant(gem.itemRarity)}
                      className='mt-0.5 text-xs'
                    >
                      {gem.itemRarity}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 