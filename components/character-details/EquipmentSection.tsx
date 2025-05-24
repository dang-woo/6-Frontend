'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator' // 사용 X
// DFCharacterResponseDTO 사용 X
import { EquipmentDTO, EnchantDTO, FusionOptionDTO, StatusDetailDTO } from '@/types/dnf'

interface EquipmentSectionProps {
  equipment: EquipmentDTO[] | undefined
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

export function EquipmentSection({ equipment }: EquipmentSectionProps) {
  if (!equipment || equipment.length === 0) {
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
      <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4">
        {equipment.map((equip) => (
          <li key={equip.itemId || equip.itemName} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-3">
              {equip.itemImage && (
                <div className="relative w-12 h-12 flex-shrink-0 mt-1">
                  <Image 
                    src={equip.itemImage} 
                    alt={equip.itemName} 
                    fill 
                    sizes="48px" 
                    className="rounded-md bg-background object-contain border"
                    unoptimized 
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 
                    className={`text-md font-semibold ${equip.itemRarity === '태초' ? 'text-yellow-400' : equip.itemRarity === '에픽' ? 'text-pink-500' : equip.itemRarity === '레전더리' ? 'text-orange-500' : equip.itemRarity === '신화' ? 'text-purple-400' : 'text-foreground'}`}
                    title={equip.itemName}
                  >
                    {equip.itemName}
                  </h3>
                  <Badge variant={equip.itemGradeName ? 'secondary' : 'outline'} className="text-xs ml-2 whitespace-nowrap">{equip.itemGradeName || '등급 정보 없음'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{equip.slotName}</p>
                
                <div className="mt-1 space-y-0.5 text-xs">
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
        ))}
      </ul>
    </div>
  );
} 