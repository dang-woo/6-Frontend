'use client'

import Image from 'next/image'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { 
  NeopleTalismanApiResponseDTO, 
  TalismanSlotInfo, 
  RuneDTO, 
  // TalismanItemDTO // itemImage 필드가 실제 API 응답에 없으므로, 이 타입을 직접 수정하거나 아래처럼 인라인으로 사용
} from '@/types/dnf'
import { useEffect, useState } from 'react'

// API 응답에 itemImage가 없으므로, TalismanItemDTO 정의에서 해당 필드를 제거하거나 선택적으로 만듭니다.
// 여기서는 TalismanSection 내에서 필요한 부분만 사용하도록 가정합니다.
interface TalismanItemDTO {
  slotNo?: number; // API 응답에 없지만, 기존 타입에 있었을 수 있으므로 선택적으로 유지
  itemId: string;
  itemName: string;
  itemImage?: string; // API 응답에 없으므로 제거 또는 옵셔널 처리. 여기서는 옵셔널로 처리.
}

interface TalismanSectionProps {
  serverId: string;
  characterId: string;
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
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        console.error('Error data from proxy:', errorData);
      } catch (e) {
        console.error('Error text from proxy (not JSON):', errorText);
      }
      return null
    }
    const data = await response.json()
    return data.imageUrl || null
  } catch (error) {
    console.error(`Error fetching image URL for item ${itemId} via proxy:`, error)
    return null
  }
}

export function TalismanSection ({ serverId, characterId }: TalismanSectionProps) {
  const [talismanData, setTalismanData] = useState<NeopleTalismanApiResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [talismanImageUrls, setTalismanImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!serverId || !characterId) {
      setIsLoading(false);
      setError('서버 ID 또는 캐릭터 ID가 필요합니다.');
      setTalismanData(null);
      return;
    }

    const fetchTalismans = async () => {
      setIsLoading(true);
      setError(null);
      setTalismanData(null);
      try {
        const response = await fetch(`/api/character/${serverId}/${characterId}/talismans`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: NeopleTalismanApiResponseDTO = await response.json();
        setTalismanData(data);
      } catch (err: any) {
        console.error('Failed to fetch talisman data:', err);
        setError(err.message || '탈리스만 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalismans();
  }, [serverId, characterId]);

  useEffect(() => {
    if (talismanData && talismanData.talismans) {
      const fetchImageUrls = async () => {
        const urls: Record<string, string> = {};
        for (const slotInfo of talismanData.talismans) {
          if (slotInfo && slotInfo.talisman && slotInfo.talisman.itemId) {
            const talItemId = slotInfo.talisman.itemId;
            // itemImage 필드는 API 응답에 없으므로 직접 사용하지 않습니다.
            // 항상 프록시를 통해 이미지 URL을 가져옵니다.
            const proxyUrl = await fetchItemImageUrlFromProxy(talItemId);
            urls[talItemId] = proxyUrl || '/images/placeholder.png';
          }
        }
        setTalismanImageUrls(urls);
      };
      fetchImageUrls();
    }
  }, [talismanData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>탈리스만</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm flex flex-col">
              <div className="flex items-start gap-3">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>탈리스만</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  const equippedTalismans: TalismanSlotInfo[] = 
    talismanData?.talismans
      ?.filter((slot): slot is TalismanSlotInfo => {
        if (!slot || !slot.talisman) { 
          return false;
        }
        return true; 
      }) || [];

  const characterDisplayName = talismanData?.characterName || '정보 없음';

  if (!talismanData || equippedTalismans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>탈리스만 ({characterDisplayName})</CardTitle>
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
        <CardTitle>탈리스만 ({characterDisplayName})</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
          {equippedTalismans.map((slotInfo, index) => {
            // TalismanItemDTO 타입을 여기서 명시적으로 사용하거나, slotInfo.talisman 타입을 as로 캐스팅합니다.
            const talismanItem = slotInfo.talisman as TalismanItemDTO;
            const runes = slotInfo.runes;
            const talismanKey = talismanItem.itemId || `talisman-${index}`;
            // talismanImageUrls에서 itemId로 직접 조회합니다.
            const talismanImgSrc = talismanItem.itemId ? (talismanImageUrls[talismanItem.itemId] || '/images/placeholder.png') : '/images/placeholder.png';

            return (
              <li key={talismanKey} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start gap-3 flex-grow">
                  <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                    <Image
                      src={talismanImgSrc}
                      alt={talismanItem.itemName}
                      width={48}
                      height={48}
                      className='object-contain p-0.5'
                      onError={(e) => {
                        if (talismanItem.itemId && talismanImageUrls[talismanItem.itemId] && talismanImageUrls[talismanItem.itemId] !== '/images/placeholder.png') {
                          setTalismanImageUrls(prev => ({ ...prev, [talismanItem.itemId!]: '/images/placeholder.png' }));
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div>
                      <h4 className="text-md font-semibold truncate" title={talismanItem.itemName}> 
                        {talismanItem.itemName}
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
                          {runes.map((rune: RuneDTO | null, runeIndex: number) => {
                            if (!rune || !rune.itemId) return null; // rune.itemId가 없는 경우 렌더링하지 않음
                            return (
                              <div key={rune.itemId || `rune-${runeIndex}-${talismanKey}`} className="flex items-center text-xs text-gray-700 dark:text-gray-200">
                                <span className="ml-1 p-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">{rune.itemName}</span>
                              </div>
                            );
                          })}
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