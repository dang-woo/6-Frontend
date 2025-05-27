'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator' // 사용 X
// DFCharacterResponseDTO 사용 X
import { EquipmentDTO, EnchantDTO, FusionOptionDTO, StatusDetailDTO, SetItemInfoDTO } from '@/types/dnf'
import { useEffect, useState } from 'react'

interface EquipmentData {
  equipment: EquipmentDTO[];
  setItemInfo?: any; // SetItemInfoDTO | null -> any로 임시 변경
}

interface EquipmentSectionProps {
  data: EquipmentData | null | undefined; 
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
    if (data && data.equipment) {
      const fetchPromises = data.equipment.map(async (item: EquipmentDTO) => {
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
      });

      Promise.all(fetchPromises).then(results => {
        const urls: Record<string, string> = {};
        results.forEach(r => {
          if (r && r.itemId && r.url) {
            urls[r.itemId] = r.url;
          }
        });
        setEquipmentImageUrls(urls);
      });
    }
  }, [data]);

  if (!data || !data.equipment || data.equipment.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>장착 장비</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">장착된 장비 정보가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  const { equipment, setItemInfo } = data;

  // 슬롯 이름 순서 정의
  const slotOrder: string[] = [
    '무기',
    '칭호',
    '머리어깨',
    '상의',
    '하의',
    '벨트',
    '신발',
    '팔찌',
    '목걸이',
    '반지',
    '보조장비',
    '마법석',
    '귀걸이',
    // 추가적인 슬롯이 있다면 여기에 추가
  ];

  const sortedEquipment = [...equipment].sort((a: EquipmentDTO, b: EquipmentDTO) => {
    const indexA = slotOrder.indexOf(a.slotName);
    const indexB = slotOrder.indexOf(b.slotName);
    // 정의되지 않은 슬롯은 뒤로 정렬
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>장착 장비</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedEquipment.map((item) => {
            const itemImgSrc = item.itemId ? (equipmentImageUrls[item.itemId] || item.itemImage || '/images/placeholder.png') : (item.itemImage || '/images/placeholder.png');

            return (
              <li key={item.itemId || item.itemName} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-start gap-3 flex-grow">
                  <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                    {item.itemId ? (
                      <Image 
                        src={itemImgSrc} 
                        alt={item.itemName} 
                        width={48}
                        height={48}
                        className="object-contain p-0.5"
                        unoptimized 
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.png'; 
                          if (item.itemImage && item.itemId && equipmentImageUrls[item.itemId] !== '/images/placeholder.png') {
                            fetchItemImageUrlFromProxy(item.itemId).then(url => {
                              if (url) setEquipmentImageUrls(prev => ({ ...prev, [item.itemId!]: url }))
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
                        className={`text-md font-semibold truncate ${
                          item.itemRarity === '태초'
                            ? item.itemName.includes('흑아')
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-blue-500 dark:text-blue-400'
                            : item.itemRarity === '에픽'
                              ? 'text-yellow-500 dark:text-yellow-400'
                              : item.itemRarity === '레전더리'
                                ? 'text-orange-500 dark:text-orange-400'
                                : item.itemRarity === '유니크'
                                  ? 'text-pink-500 dark:text-pink-400'
                                  : item.itemRarity === '레어'
                                    ? 'text-purple-500 dark:text-purple-400'
                                    : 'text-gray-800 dark:text-gray-100' // 기본값
                        } line-clamp-2`}
                        title={item.itemName}
                      >
                        {item.itemName}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <span>{item.slotName}</span> 
                        <Badge variant={item.itemGradeName ? getItemRarityVariant(item.itemRarity) : 'outline'} className="text-[10px] px-1 py-0 font-normal ml-1 h-auto align-middle">{item.itemGradeName || '정보 없음'}</Badge>
                      </div>
                    </div>
                    
                    <div className="mt-1 space-y-0.5 text-xs flex-grow">
                      {item.reinforce && item.reinforce !== '0' && 
                        <div>강화/증폭: <Badge variant="outline" className="px-1 py-0 font-normal">+{item.reinforce} {item.amplificationName || ''}</Badge></div>
                      }
                      {item.setItemName && <p className="truncate">세트: {item.setItemName}</p>}
                      {renderEnchant(item.enchant)}
                      {renderFusionOption(item.fusionOption)}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {setItemInfo && setItemInfo.setItemName && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg shadow">
            <h4 className="font-semibold text-lg mb-2 text-orange-500">세트 효과: {setItemInfo.setItemName}</h4>
            <ul className="space-y-1 text-sm">
              {setItemInfo.activeSetNoOptions?.map((option: any, index: number) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">{option.optionText} (활성: {option.activeSetOptionCount})</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 