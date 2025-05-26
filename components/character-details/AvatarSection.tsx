'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvatarDTO, EmblemDTO } from '@/types/dnf'
import { useEffect, useState } from 'react'

interface AvatarSectionProps {
  avatar: AvatarDTO[] | undefined
}

const getItemRarityVariant = (rarity: string): 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined => {
  switch (rarity) {
    case '커먼':
    case '언커먼':
      return 'secondary'
    case '레어':
    case '클론레어':
      return 'default'
    case '유니크':
      return 'default' 
    case '에픽':
      return 'destructive'
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

function renderEmblems(emblems: EmblemDTO[] | undefined | null) {
  if (!emblems || emblems.length === 0) return <p className="text-xs text-muted-foreground mt-1">엠블렘: 없음</p>;
  return (
    <div className="mt-1.5">
      <p className="text-xs font-medium mb-0.5">엠블렘:</p>
      <div className="flex flex-wrap gap-1">
        {emblems.map((emb, i) => (
          <Badge 
            key={i} 
            variant="outline"
            className={`text-[10px] px-1 py-0 leading-tight font-normal ${emb.itemRarity === '레어' ? 'border-blue-500 text-blue-500' : emb.itemRarity === '유니크' ? 'border-purple-500 text-purple-500' : emb.itemRarity === '에픽' ? 'border-pink-500 text-pink-500' : ''}`}
            title={`${emb.itemName} (${emb.itemRarity}) - Slot ${emb.slotNo}`}
          >
            {emb.itemName}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function AvatarSection({ avatar }: AvatarSectionProps) {
  const [avatarImageUrls, setAvatarImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (avatar) {
      const fetchPromises = avatar.map(async (item) => {
        if (item.itemId) {
          let finalUrl = '/images/placeholder.png';
          if (item.itemImage) {
            finalUrl = item.itemImage;
          } else {
            const proxyUrl = await fetchItemImageUrlFromProxy(item.itemId);
            if (proxyUrl) finalUrl = proxyUrl;
          }
          return { itemId: item.itemId, url: finalUrl };
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
        setAvatarImageUrls(urls);
      });
    }
  }, [avatar]);

  if (!avatar || avatar.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>아바타</CardTitle>
        </CardHeader>
        <CardContent>
          <p>장착한 아바타가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  const slotOrder = ['머리', '모자', '얼굴', '목가슴', '상의', '하의', '허리', '신발', '피부', '오라', '무기'];
  const sortedAvatar = [...avatar].sort((a, b) => {
    const indexA = slotOrder.indexOf(a.slotName);
    const indexB = slotOrder.indexOf(b.slotName);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">아바타</h2>
      <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        {sortedAvatar.map((item) => {
          const itemImgSrc = item.itemId ? (avatarImageUrls[item.itemId] || item.itemImage || '/images/placeholder.png') : (item.itemImage || '/images/placeholder.png');
          
          return (
          <li key={item.itemId || item.itemName} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors flex flex-col">
            <div className="flex items-start gap-3 flex-grow">
              <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-muted/20 rounded-md flex items-center justify-center overflow-hidden border">
                {item.itemId ? (
                  <Image 
                    src={itemImgSrc} 
                    alt={item.itemName} 
                    fill
                    sizes="48px"
                    className="object-contain"
                    unoptimized
                    onError={() => {
                      if (item.itemImage && item.itemId && avatarImageUrls[item.itemId] !== '/images/placeholder.png') {
                        fetchItemImageUrlFromProxy(item.itemId).then(url => {
                          if (url) setAvatarImageUrls(prev => ({ ...prev, [item.itemId!]: url }))
                          else setAvatarImageUrls(prev => ({ ...prev, [item.itemId!]: '/images/placeholder.png' }))
                        })
                      }
                    }}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">이미지 없음</span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div>
                  <h3 
                    className={`text-md font-semibold ${item.itemRarity === '레어' ? 'text-blue-500' : item.itemRarity === '클론레어' ? 'text-teal-400' : item.itemRarity === '유니크' ? 'text-purple-500' : item.itemRarity === '에픽' ? 'text-pink-500' : 'text-foreground'}`}
                    title={item.itemName}
                  >
                    {item.itemName}
                  </h3>
                  <div className="text-sm text-muted-foreground">{item.slotName} <Badge variant={getItemRarityVariant(item.itemRarity)} className="text-xs px-1 py-0 font-normal ml-1">{item.itemRarity}</Badge></div>
                </div>
                
                <div className="mt-1 space-y-0.5 text-xs flex-grow">
                  {item.clone?.itemName && <p className="truncate">클론: {item.clone.itemName}</p>}
                  {item.optionAbility && <p className="truncate">옵션: {item.optionAbility}</p>}
                  {renderEmblems(item.emblems)}
                </div>
              </div>
            </div>
          </li>
        )})}
      </ul>
    </div>
  );
} 