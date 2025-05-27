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
  // console.log('CreatureSection data:', data); // 디버깅 시 사용

  const [activeCreatureImageUrl, setActiveCreatureImageUrl] = useState<string | null>(null);
  const [artifactImageUrls, setArtifactImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.itemId) {
      fetchItemImageUrlFromProxy(data.itemId)
        .then(url => setActiveCreatureImageUrl(url || data?.itemImage || '/images/placeholder.png'));
    }
    if (data?.artifact) {
      const fetchPromises = data.artifact.map(async (artifact) => {
        if (artifact.itemId) {
          const url = await fetchItemImageUrlFromProxy(artifact.itemId);
          return { itemId: artifact.itemId, url: url || artifact.itemImage || '/images/placeholder.png' };
        }
        return null;
      });
      Promise.all(fetchPromises.filter(p => p !== null) as Promise<{itemId: string, url: string}>[])
        .then(results => {
          const urls = results.reduce((acc, current) => {
            if (current) acc[current.itemId] = current.url;
            return acc;
          }, {} as Record<string, string>);
          setArtifactImageUrls(urls);
        });
    }
  }, [data]);

  // 데이터가 없거나, creature 정보가 없는 경우 "정보 없음" 메시지 표시
  if (!data) {
    return (
      <Card> {/* Card 컴포넌트로 감싸기 */}
        <CardHeader>
          <CardTitle>크리쳐</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">크리쳐 정보가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  const artifact = data.artifact;
  const activeCreatureImgSrc = activeCreatureImageUrl || data.itemImage || '/images/placeholder.png';

  return (
    <Card> {/* Card 컴포넌트로 감싸기 */}
      <CardHeader>
        <CardTitle>크리쳐</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 활성화된 크리쳐 정보 */}
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
              <Image
                src={activeCreatureImgSrc}
                alt={data.itemName || '크리쳐'}
                fill
                sizes='(max-width: 640px) 96px, 128px'
                className='object-contain p-1'
                onError={() => {
                  if (data.itemImage && data.itemId && activeCreatureImageUrl !== '/images/placeholder.png') {
                    fetchItemImageUrlFromProxy(data.itemId).then(url => {
                      if (url) setActiveCreatureImageUrl(url)
                      else setActiveCreatureImageUrl('/images/placeholder.png')
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
        </div>

        {/* 아티팩트 정보 */}
        {artifact && artifact.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">아티팩트</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {artifact.map((art) => {
                const artifactKey = art.itemId || `artifact-${Math.random()}`;
                const artifactDefaultImgSrc = art.itemImage || '/images/placeholder.png'
                const artifactImgToDisplay = art.itemId ? (artifactImageUrls[art.itemId] || artifactDefaultImgSrc) : artifactDefaultImgSrc

                return (
                  <li key={artifactKey} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex items-start gap-3 flex-grow">
                      <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                        <Image
                          src={artifactImgToDisplay} 
                          alt={art.itemName}
                          width={48}
                          height={48}
                          className='object-contain p-0.5'
                          onError={() => {
                            if (art.itemImage && art.itemId && artifactImageUrls[art.itemId] !== '/images/placeholder.png') {
                              fetchItemImageUrlFromProxy(art.itemId).then(url => {
                                if (url) {
                                  setArtifactImageUrls(prev => ({ ...prev, [art.itemId!]: url }))
                                } else {
                                  setArtifactImageUrls(prev => ({ ...prev, [art.itemId!]: '/images/placeholder.png' }))
                                }
                              })
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div>
                          <h4 className="text-md font-semibold truncate" title={art.itemName}> 
                            {art.itemName}
                          </h4>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Badge
                              variant={getItemRarityVariant(art.itemRarity)}
                              className='text-[10px] px-1 py-0 font-normal h-auto align-middle'
                            >
                              {art.itemRarity}
                            </Badge>
                          </div>
                        </div>
                        {art.itemAvailableLevel != null && (
                          <p className="text-xs text-muted-foreground mt-1">레벨제한: {art.itemAvailableLevel}</p>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </CardContent>
    </Card>
  );
} 