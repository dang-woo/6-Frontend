'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CreatureDTO, ArtifactDTO } from '@/types/dnf'
import { useEffect, useState } from 'react'

interface CreatureSectionProps {
  data: CreatureDTO | null | undefined;
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
      return null
    }
    const data = await response.json()
    return data.imageUrl || null
  } catch (error) {
    console.error(`Error fetching image URL for item ${itemId}:`, error)
    return null
  }
}

export function CreatureSection({ data }: CreatureSectionProps) {
  const [creatureImageUrl, setCreatureImageUrl] = useState<string>('/images/placeholder.png')
  const [artifactImageUrls, setArtifactImageUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (data?.itemId) {
      if (data.itemImage) {
        setCreatureImageUrl(data.itemImage)
      } else {
        fetchItemImageUrlFromProxy(data.itemId).then(url => {
          if (url) setCreatureImageUrl(url)
          else setCreatureImageUrl('/images/placeholder.png')
        })
      }
    }

    if (data?.artifact) {
      const fetchPromises = data.artifact.map(async (art) => {
        if (art.itemId) {
          let finalUrl = '/images/placeholder.png'
          if (art.itemImage) {
            finalUrl = art.itemImage
          } else {
            const proxyUrl = await fetchItemImageUrlFromProxy(art.itemId)
            if (proxyUrl) finalUrl = proxyUrl
          }
          return { itemId: art.itemId, url: finalUrl }
        }
        return { itemId: art.itemId || `no-id-${Math.random()}`, url: '/images/placeholder.png' }
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
  }, [data])

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>크리쳐</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">크리쳐 정보가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
              <Image
                src={creatureImageUrl}
                alt={data.itemName || '크리쳐'}
                fill
                sizes='(max-width: 640px) 96px, 128px'
                className='object-contain p-1'
                onError={() => {
                  if (data.itemImage && data.itemId && creatureImageUrl !== '/images/placeholder.png') {
                    fetchItemImageUrlFromProxy(data.itemId).then(url => {
                      if (url) setCreatureImageUrl(url)
                      else setCreatureImageUrl('/images/placeholder.png')
                    })
                  }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold leading-none tracking-tight mb-1">{data.itemName || '크리쳐 이름 없음'}</h3>
              <Badge
                variant={getItemRarityVariant(data.itemRarity)}
                className='text-sm'
              >
                {data.itemRarity}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.artifact && data.artifact.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold tracking-tight mb-3">아티팩트</h3>
          <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
            {data.artifact.map((artifact: ArtifactDTO, index: number) => {
              const artifactKey = artifact.itemId || `artifact-${index}`;
              const artifactDefaultImgSrc = artifact.itemImage || '/images/placeholder.png'
              const artifactImgToDisplay = artifact.itemId ? (artifactImageUrls[artifact.itemId] || artifactDefaultImgSrc) : artifactDefaultImgSrc

              return (
                <li key={artifactKey} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-start gap-3 flex-grow">
                    <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                      <Image
                        src={artifactImgToDisplay} 
                        alt={artifact.itemName}
                        width={48}
                        height={48}
                        className='object-contain p-0.5'
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
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div>
                        <h4 className="text-md font-semibold truncate" title={artifact.itemName}> 
                          {artifact.itemName}
                        </h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Badge
                            variant={getItemRarityVariant(artifact.itemRarity)}
                            className='text-[10px] px-1 py-0 font-normal h-auto align-middle'
                          >
                            {artifact.itemRarity}
                          </Badge>
                        </div>
                      </div>
                      {artifact.itemAvailableLevel != null && (
                        <p className="text-xs text-muted-foreground mt-1">레벨제한: {artifact.itemAvailableLevel}</p>
                      )}
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