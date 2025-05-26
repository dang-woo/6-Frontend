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
import { useEffect, useState } from 'react'

interface TalismanSectionProps {
  data: TalismansDTO[] | null | undefined;
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

export function TalismanSection ({ data }: TalismanSectionProps) {
  const [talismanImageUrls, setTalismanImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const fetchPromises = data.map(async (talismanInfo) => {
        if (talismanInfo.talisman?.itemId) {
          const talItemId = talismanInfo.talisman.itemId;
          let finalUrl = '/images/placeholder.png';
          if (talismanInfo.talisman.itemImage) {
            finalUrl = talismanInfo.talisman.itemImage;
          } else {
            const proxyUrl = await fetchItemImageUrlFromProxy(talItemId);
            if (proxyUrl) finalUrl = proxyUrl;
          }
          return { itemId: talItemId, url: finalUrl };
        }
        return null;
      }).filter(p => p !== null) as Promise<{itemId: string, url: string}>[];

      Promise.all(fetchPromises).then(results => {
        const urls: Record<string, string> = {};
        results.forEach(r => {
          if (r.itemId && r.url) {
            urls[r.itemId] = r.url;
          }
        });
        setTalismanImageUrls(urls);
      });
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>탈리스만</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">장착한 탈리스만이 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>탈리스만</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
          {data.map((talismanInfo, index) => {
            if (!talismanInfo.talisman) return null

            const talisman = talismanInfo.talisman
            const runes = talismanInfo.runes
            const talismanKey = talisman.itemId || `talisman-${index}`;
            const talismanImgSrc = talisman.itemId ? (talismanImageUrls[talisman.itemId] || talisman.itemImage || '/images/placeholder.png') : '/images/placeholder.png';

            return (
              <li key={talismanKey} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start gap-3 flex-grow">
                  <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                    <Image
                      src={talismanImgSrc}
                      alt={talisman.itemName}
                      width={48}
                      height={48}
                      className='object-contain p-0.5'
                      onError={() => {
                        if (talisman.itemImage && talisman.itemId && talismanImageUrls[talisman.itemId] !== '/images/placeholder.png') {
                          fetchItemImageUrlFromProxy(talisman.itemId).then(url => {
                            if (url) setTalismanImageUrls(prev => ({ ...prev, [talisman.itemId!]: url }))
                            else setTalismanImageUrls(prev => ({ ...prev, [talisman.itemId!]: '/images/placeholder.png' }))
                          })
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div>
                      <h4 className="text-md font-semibold truncate" title={talisman.itemName}> 
                        {talisman.itemName}
                      </h4>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Badge variant={getItemRarityVariant('유니크')} className='text-[10px] px-1 py-0 font-normal h-auto align-middle'>
                          유니크 탈리스만
                        </Badge>
                      </div>
                    </div>
                    {runes && runes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">장착 룬:</p>
                        <div className="space-y-1">
                          {runes.map((rune: RuneDTO, runeIndex: number) => (
                            <div key={rune.itemId || `rune-${runeIndex}-${talismanKey}`} className="flex items-center text-xs text-gray-700 dark:text-gray-200">
                              <span className="ml-1 p-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">{rune.itemName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
} 