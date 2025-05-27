'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvatarDTO, EmblemDTO } from '@/types/dnf'
import { useEffect, useState } from 'react'

interface AvatarSectionProps {
  data: AvatarDTO[] | undefined; // 타입을 명확히 지정
}

const getItemRarityVariant = (rarity: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (rarity) {
    case '커먼':
    case '언커먼':
      return 'secondary'
    case '레어':
    case '클론레어':
      return 'outline'
    case '유니크':
      return 'outline' 
    case '에픽':
      return 'destructive'
    case '크로니클':
    case '레전더리':
    case '신화':
      return 'outline'
    default:
      return 'default'
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

function renderEmblems(emblems: EmblemDTO[] | null) {
  if (!emblems || emblems.length === 0) return null;
  return (
    <div className="mt-1">
      <p className="text-xs font-medium mb-0.5 text-gray-600 dark:text-gray-300">엠블렘:</p>
      <ul className="flex flex-wrap gap-1">
        {emblems.map((emblem, index) => (
          <li key={`${emblem.itemName}-${emblem.slotNo}-${index}`} 
              className={`text-[10px] px-1.5 py-0.5 rounded-sm border 
                          ${emblem.itemRarity === '레어' ? 'border-blue-400 text-blue-600 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-900/30' : 
                            emblem.itemRarity === '유니크' ? 'border-purple-400 text-purple-600 bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:bg-purple-900/30' : 
                            emblem.itemRarity === '에픽' ? 'border-pink-400 text-pink-600 bg-pink-50 dark:border-pink-700 dark:text-pink-300 dark:bg-pink-900/30' : 
                            'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700/30'}
                          font-normal leading-tight`}
              title={`${emblem.itemName} (${emblem.itemRarity}) - Slot ${emblem.slotNo}`}>
            {emblem.itemName}
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderOptionAbility(optionAbility: string | null) {
  if (!optionAbility) return null;
  return (
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">옵션: {optionAbility}</p>
  );
}

export function AvatarSection({ data }: AvatarSectionProps) {
  // console.log('AvatarSection data:', data); // 디버깅 시 사용

  const [avatarImageUrls, setAvatarImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const fetchPromises = data.map(async (item) => {
        if (item.itemId) {
          // item.itemImage가 완전한 URL을 포함한다고 가정, 없으면 플레이스홀더
          const imageUrl = item.itemImage || '/images/placeholder.png'; 
          // 이미지가 CDN URL이거나 외부 URL인 경우 직접 사용
          // 만약 프록시나 특정 API를 통해 이미지를 가져와야 한다면 해당 로직 추가
          // 현재는 item.itemImage를 그대로 사용하거나, 없으면 플레이스홀더를 사용
          return { itemId: item.itemId, url: imageUrl };
        }
        return null;
      });

      Promise.all(fetchPromises.filter(p => p !== null) as Promise<{itemId: string, url: string}>[])
        .then(results => {
          const urls = results.reduce((acc, current) => {
            if (current) acc[current.itemId] = current.url;
            return acc;
          }, {} as Record<string, string>);
          setAvatarImageUrls(urls);
        });
    }
  }, [data]);

  // 데이터가 없거나 빈 배열인 경우 "정보 없음" 메시지 표시
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>아바타</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">아바타 정보가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  const slotOrder = ['머리', '모자', '얼굴', '목가슴', '상의', '하의', '허리', '신발', '피부', '오라', '무기', '무기 클론 아바타'];
  const sortedAvatar = [...data].sort((a, b) => {
    const indexA = slotOrder.indexOf(a.slotName);
    const indexB = slotOrder.indexOf(b.slotName);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>아바타</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 모바일: 1열, sm 이상: 2열. space-y-3 제거하고 gap-4로 간격 통일 */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedAvatar.map((avatarItem) => {
            const itemImgSrc = avatarItem.itemId ? (avatarImageUrls[avatarItem.itemId] || avatarItem.itemImage || '/images/placeholder.png') : (avatarItem.itemImage || '/images/placeholder.png');
            const key = `${avatarItem.slotName}-${avatarItem.itemName}-${avatarItem.itemId || 'no-id'}`;
            return (
              <li key={key} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start gap-3 flex-grow">
                  <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                    <Image 
                      src={itemImgSrc}
                      alt={avatarItem.itemName || '아바타 이미지'} 
                      width={48}
                      height={48}
                      className="object-contain p-0.5"
                      unoptimized={!itemImgSrc.startsWith('/')}
                      onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div>
                      <h3 
                        className={`text-md font-semibold truncate ${avatarItem.itemRarity === '레어' ? 'text-blue-600 dark:text-blue-400' : avatarItem.itemRarity === '클론레어' ? 'text-teal-600 dark:text-teal-400' : avatarItem.itemRarity === '유니크' ? 'text-purple-600 dark:text-purple-400' : avatarItem.itemRarity === '에픽' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-800 dark:text-gray-100'}`}
                        title={avatarItem.itemName}
                      >
                        {avatarItem.itemName}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <span>{avatarItem.slotName}</span> 
                        <Badge variant={getItemRarityVariant(avatarItem.itemRarity)} className="text-[10px] px-1 py-0 font-normal ml-1 h-auto align-middle">{avatarItem.itemRarity}</Badge>
                      </div>
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs flex-grow">
                      {avatarItem.clone?.itemName && <p className="truncate">클론: {avatarItem.clone.itemName}</p>}
                      {renderOptionAbility(avatarItem.optionAbility)}
                      {renderEmblems(avatarItem.emblems)}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </CardContent>
    </Card>
  );
} 