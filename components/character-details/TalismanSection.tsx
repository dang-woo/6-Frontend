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

export function TalismanSection ({ talismans }: TalismanSectionProps) {
  const [talismanImageUrls, setTalismanImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (talismans) {
      const fetchPromises = talismans.map(async (talismanInfo) => {
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
  }, [talismans]);

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
        const talismanImgSrc = talisman.itemId ? (talismanImageUrls[talisman.itemId] || talisman.itemImage || '/images/placeholder.png') : '/images/placeholder.png';

        return (
          <Card key={talisman.itemId} className='overflow-hidden flex flex-col'>
            <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/10'>
              {talisman.itemId && (
                <div className='relative w-12 h-12 flex-shrink-0'>
                  <Image
                    src={talismanImgSrc}
                    alt={talisman.itemName}
                    fill
                    sizes='48px'
                    className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
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
              )}
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-base font-semibold truncate' title={talisman.itemName}>
                  {talisman.itemName}
                </CardTitle>
                <Badge variant={getItemRarityVariant('유니크')} className='mt-1 text-xs'>
                  유니크 탈리스만
                </Badge>
              </div>
            </CardHeader>
            {runes && runes.length > 0 && (
              <CardContent className='p-3 flex-grow'>
                <h4 className='text-sm font-medium text-muted-foreground mb-1.5'>장착 룬:</h4>
                <div className='space-y-1.5'>
                  {runes.map((rune: RuneDTO) => (
                    <div key={rune.itemId || rune.itemName} className='flex items-center p-1.5 border rounded-md bg-background/30'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium truncate' title={rune.itemName}>
                          {rune.itemName}
                        </p>
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