'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SetItemInfoDTO, StatusDetailDTO } from '@/types/dnf'

interface SetItemSectionProps {
  setItemInfo: SetItemInfoDTO[] | null
}

const getItemRarityVariant = (
  rarity: string | null | undefined
): 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined => {
  if (!rarity) return 'outline'
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

export function SetItemSection ({ setItemInfo }: SetItemSectionProps) {
  if (!setItemInfo || setItemInfo.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>세트 아이템 효과</CardTitle>
        </CardHeader>
        <CardContent>
          <p>적용 중인 세트 아이템 효과가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {setItemInfo.map((set, index) => (
        <Card key={set.setItemName || index} className='overflow-hidden shadow-md'>
          <CardHeader className='bg-muted/20 p-4'>
            <CardTitle className='text-xl font-bold'>{set.setItemName}</CardTitle>
            <Badge variant={getItemRarityVariant(set.setItemRarityName)} className='mt-1 text-sm'>
              {set.setItemRarityName} 세트
            </Badge>
          </CardHeader>
          {set.active && (
            <CardContent className='p-4 text-sm'>
              {set.active.explain && (
                <div className='mb-3'>
                  <h4 className='font-semibold text-muted-foreground mb-1'>세트 효과 설명:</h4>
                  <p className='whitespace-pre-line text-gray-700 dark:text-gray-300'>{set.active.explain}</p>
                </div>
              )}
              {set.active.buffExplain && (
                <div className='mb-3'>
                  <h4 className='font-semibold text-muted-foreground mb-1'>버프 효과 설명:</h4>
                  <p className='whitespace-pre-line text-gray-700 dark:text-gray-300'>{set.active.buffExplain}</p>
                </div>
              )}
              {set.active.status && set.active.status.length > 0 && (
                <div className='mb-3'>
                  <h4 className='font-semibold text-muted-foreground mb-1'>추가 스탯:</h4>
                  <ul className='list-disc list-inside space-y-0.5 pl-2'>
                    {set.active.status.map((stat: StatusDetailDTO, i: number) => (
                      <li key={i} className='text-gray-700 dark:text-gray-300'>
                        {stat.name}: <span className='font-semibold'>{stat.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {set.active.setPoint && (
                <div>
                  <h4 className='font-semibold text-muted-foreground mb-1'>세트 포인트:</h4>
                  <p className='text-gray-700 dark:text-gray-300'>
                    현재 <span className='font-semibold'>{set.active.setPoint.current}</span> / 최소 <span className='font-semibold'>{set.active.setPoint.min}</span> / 최대 <span className='font-semibold'>{set.active.setPoint.max}</span>
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
} 