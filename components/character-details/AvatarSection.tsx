'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvatarDTO, EmblemDTO } from '@/types/dnf'

interface AvatarSectionProps {
  avatar: AvatarDTO[] | undefined
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
      <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4">
        {sortedAvatar.map((item) => (
          <li key={item.itemId || item.itemName} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-muted/20 rounded-md flex items-center justify-center overflow-hidden border">
                {item.itemImage ? (
                  <Image 
                    src={item.itemImage} 
                    alt={item.itemName} 
                    fill
                    sizes="48px"
                    className="object-contain"
                    unoptimized 
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">이미지 없음</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 
                  className={`text-md font-semibold ${item.itemRarity === '레어' ? 'text-blue-500' : item.itemRarity === '클론레어' ? 'text-teal-400' : item.itemRarity === '유니크' ? 'text-purple-500' : item.itemRarity === '에픽' ? 'text-pink-500' : 'text-foreground'}`}
                  title={item.itemName}
                >
                  {item.itemName}
                </h3>
                <div className="text-sm text-muted-foreground">{item.slotName} <Badge variant="outline" className="text-xs px-1 py-0 font-normal ml-1">{item.itemRarity}</Badge></div>
                
                <div className="mt-1 space-y-0.5 text-xs">
                  {item.clone?.itemName && <p className="truncate">클론: {item.clone.itemName}</p>}
                  {item.optionAbility && <p className="truncate">옵션: {item.optionAbility}</p>}
                  {renderEmblems(item.emblems)}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 