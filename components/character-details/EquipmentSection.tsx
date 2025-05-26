'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator' // 사용 X
// DFCharacterResponseDTO 사용 X
import { EquipmentDTO, EnchantDTO, FusionOptionDTO, StatusDetailDTO } from '@/types/dnf'
import { useEffect, useState } from 'react'

interface EquipmentSectionProps {
  data: any; // 실제로는 DFCharacterResponseDTO['equipment'] 와 같은 구체적인 타입 사용 권장
}

// getItemRarityVariant (공통 유틸로 분리 권장)
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
    case '신화': // 신화도 에픽과 유사한 색상으로 처리하거나 커스텀 필요
      return 'destructive' 
    case '레전더리':
      return 'default' // 주황/노랑 계열 Badge 스타일 따라감
    case '태초':
      return 'default' // 특별한 색상 (Badge에서 직접 처리되거나 커스텀 필요)
    default:
      return 'outline'
  }
}

// fetchItemImageUrlFromProxy (공통 유틸로 분리 권장)
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

function renderStatusDetails(status: StatusDetailDTO[] | undefined | null) {
  if (!status || status.length === 0) return null;
  return (
    <ul className="list-disc list-inside text-xs pl-3">
      {status.map((s, i) => (
        <li key={i} className="truncate" title={`${s.name}: ${s.value}`}>{s.name}: {s.value}</li>
      ))}
    </ul>
  );
}

function renderEnchant(enchant: EnchantDTO | undefined | null) {
  if (!enchant || !enchant.status || enchant.status.length === 0) return <span className="text-xs text-muted-foreground">마법부여: 없음</span>;
  return (
    <div className="mt-1">
      <span className="text-xs font-semibold">마법부여: </span>
      {enchant.status.map((s, i) => (
        <span key={i} className="text-xs mr-2" title={`${s.name}: ${s.value}`}>{s.name} {s.value}</span>
      ))}
    </div>
  );
}

function renderFusionOption(fusionOption: FusionOptionDTO | undefined | null) {
  if (!fusionOption || !fusionOption.options || fusionOption.options.length === 0) return null;
  return (
    <div className="mt-1">
      <span className="text-xs font-semibold text-green-600 dark:text-green-500">융합: </span>
      {fusionOption.options.map((opt, i) => (
        <span key={i} className="text-xs text-green-600 dark:text-green-500 mr-2" title={opt.explain || ''}>
          {opt.explain} {opt.buff && `(버프력 ${opt.buff})`}
        </span>
      ))}
    </div>
  );
}

// renderTuneDetails 함수 사용 X -> 제거
// function renderTuneDetails(tune: TuneDTO[] | undefined | null) { ... }

export function EquipmentSection({ data }: EquipmentSectionProps) {
  const [equipmentImageUrls, setEquipmentImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const fetchPromises = data.map(async (item: any) => {
        if (item.itemId) {
          let finalUrl = '/images/placeholder.png'; // 기본 플레이스홀더
          if (item.itemImage) {
            finalUrl = item.itemImage;
          } else {
            const proxyUrl = await fetchItemImageUrlFromProxy(item.itemId);
            if (proxyUrl) finalUrl = proxyUrl;
          }
          return { itemId: item.itemId, url: finalUrl };
        }
        return null; 
      }).filter((p: {itemId: string, url: string} | null) => p !== null) as Promise<{itemId: string, url: string}>[];

      Promise.all(fetchPromises).then(results => {
        const urls: Record<string, string> = {};
        results.forEach(r => {
          if (r.itemId && r.url) {
            urls[r.itemId] = r.url;
          }
        });
        setEquipmentImageUrls(urls);
      });
    }
  }, [data]);

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>장착 장비</CardTitle>
        </CardHeader>
        <CardContent>
          <p>장착한 장비가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">장착 장비</h2>
      <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        {data.map((equip: any) => {
          const itemImgSrc = equip.itemId ? (equipmentImageUrls[equip.itemId] || equip.itemImage || '/images/placeholder.png') : (equip.itemImage || '/images/placeholder.png');

          return (
          <li key={equip.itemId || equip.itemName} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors flex flex-col">
            <div className="flex items-start gap-3 flex-grow">
              <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-muted/20 rounded-md flex items-center justify-center overflow-hidden border">
                {equip.itemId ? (
                  <Image 
                    src={itemImgSrc} 
                    alt={equip.itemName} 
                    fill 
                    sizes="48px" 
                    className="rounded-md bg-background object-contain"
                    unoptimized 
                    onError={() => {
                      if (equip.itemImage && equip.itemId && equipmentImageUrls[equip.itemId] !== '/images/placeholder.png') {
                        fetchItemImageUrlFromProxy(equip.itemId).then(url => {
                          if (url) setEquipmentImageUrls(prev => ({ ...prev, [equip.itemId!]: url }))
                          else setEquipmentImageUrls(prev => ({ ...prev, [equip.itemId!]: '/images/placeholder.png' }))
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
                  <div className="flex justify-between items-start">
                    <h3 
                      className={`text-md font-semibold ${equip.itemRarity === '태초' ? 'text-yellow-400' : equip.itemRarity === '에픽' ? 'text-pink-500' : equip.itemRarity === '레전더리' ? 'text-orange-500' : equip.itemRarity === '신화' ? 'text-purple-400' : 'text-foreground'}`}
                      title={equip.itemName}
                    >
                      {equip.itemName}
                    </h3>
                    <Badge variant={equip.itemGradeName ? getItemRarityVariant(equip.itemRarity) : 'outline'} className="text-xs ml-2 whitespace-nowrap">{equip.itemGradeName || '등급 정보 없음'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{equip.slotName}</p>
                </div>
                
                <div className="mt-1 space-y-0.5 text-xs flex-grow">
                  {equip.reinforce && equip.reinforce !== '0' && 
                    <div>강화/증폭: <Badge variant="outline" className="px-1 py-0 font-normal">+{equip.reinforce} {equip.amplificationName || ''}</Badge></div>
                  }
                  {equip.setItemName && <p className="truncate">세트: {equip.setItemName}</p>}
                  {renderEnchant(equip.enchant)}
                  {renderFusionOption(equip.fusionOption)}
                </div>
              </div>
            </div>
          </li>
        )})}
      </ul>
    </div>
  );
} 