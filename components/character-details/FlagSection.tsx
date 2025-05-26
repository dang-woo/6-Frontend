'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FlagDTO, GemDTO, ReinforceStatusDTO } from '@/types/dnf'
import { useEffect, useState } from 'react'

interface FlagSectionProps {
  data: FlagDTO | null | undefined;
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

export function FlagSection({ data }: FlagSectionProps) {
  const [flagImageUrl, setFlagImageUrl] = useState<string>('/images/placeholder.png')
  const [gemImageUrls, setGemImageUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (data?.itemId) {
      if (data.itemImage) {
        setFlagImageUrl(data.itemImage)
      } else {
        fetchItemImageUrlFromProxy(data.itemId).then(url => {
          if (url) setFlagImageUrl(url)
          else setFlagImageUrl('/images/placeholder.png')
        })
      }
    }

    if (data?.gems) {
      const fetchPromises = data.gems.map(async (gem) => {
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
        return { itemId: gem.itemId || `no-id-gem-${Math.random()}`, url: '/images/placeholder.png' }
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
  }, [data])

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>휘장</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">휘장 정보가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
              <Image
                src={flagImageUrl}
                alt={data.itemName || '휘장'}
                fill
                sizes='(max-width: 640px) 96px, 128px'
                className='object-contain p-1'
                onError={() => {
                  if (data.itemImage && data.itemId && flagImageUrl !== '/images/placeholder.png') {
                    fetchItemImageUrlFromProxy(data.itemId).then(url => {
                      if (url) setFlagImageUrl(url)
                      else setFlagImageUrl('/images/placeholder.png')
                    })
                  }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold leading-none tracking-tight mb-1">{data.itemName || '휘장 이름 없음'}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={getItemRarityVariant(data.itemRarity)}
                  className='text-sm' 
                >
                  {data.itemRarity}
                </Badge>
                {data.reinforce !== 0 && (
                  <Badge variant='outline' className='text-sm'>
                    +{data.reinforce} 강화
                  </Badge>
                )}
              </div>
              {data.reinforceStatus && data.reinforceStatus.length > 0 && (
                <div className="mt-1">
                  <h5 className='text-sm font-medium text-gray-600 dark:text-gray-300 mb-1'>강화 효과:</h5>
                  <ul className='list-disc list-inside text-xs space-y-0.5 pl-1'>
                    {data.reinforceStatus.map((status: ReinforceStatusDTO, index: number) => (
                      <li key={index} className='text-gray-700 dark:text-gray-200'>
                        {status.name}: <span className='font-semibold'>{status.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {data.gems && data.gems.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold tracking-tight mb-3">장착 젬</h3>
          <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3 xl:grid-cols-4">
            {data.gems.map((gem: GemDTO, index: number) => {
              const gemKey = gem.itemId || `gem-${index}`;
              const gemDefaultImgSrc = gem.itemImage || '/images/placeholder.png'
              const gemImgToDisplay = gem.itemId ? (gemImageUrls[gem.itemId] || gemDefaultImgSrc) : gemDefaultImgSrc

              return (
                <li key={gemKey} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-start gap-3 flex-grow">
                    <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                      <Image
                        src={gemImgToDisplay} 
                        alt={gem.itemName}
                        width={48}
                        height={48}
                        className='object-contain p-0.5'
                        onError={() => {
                          if (gem.itemImage && gem.itemId && gemImageUrls[gem.itemId] !== '/images/placeholder.png') {
                            fetchItemImageUrlFromProxy(gem.itemId).then(url => {
                              if (url) setGemImageUrls(prev => ({ ...prev, [gem.itemId!]: url }))
                              else setGemImageUrls(prev => ({ ...prev, [gem.itemId!]: '/images/placeholder.png' }))
                            })
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div>
                        <h4 className="text-md font-semibold truncate" title={gem.itemName}> 
                          {gem.itemName}
                        </h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                          <Badge
                            variant={getItemRarityVariant(gem.itemRarity)}
                            className='text-[10px] px-1 py-0 font-normal h-auto align-middle'
                          >
                            {gem.itemRarity}
                          </Badge>
                          {gem.slotNo != null && <span className="ml-2 text-xs text-muted-foreground">슬롯 {gem.slotNo}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  );
} 