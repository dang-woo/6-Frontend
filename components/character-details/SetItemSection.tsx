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
  data: SetItemInfoDTO[] | null | undefined;
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

export function SetItemSection ({ data }: SetItemSectionProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>세트 아이템 효과</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">적용 중인 세트 아이템 효과가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>세트 아이템 효과</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {data.map((set, index) => (
            <li key={set.setItemName || `set-${index}`} className="border rounded-lg shadow-sm overflow-hidden bg-white dark:bg-slate-800">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <h4 className='text-lg font-semibold text-slate-800 dark:text-slate-100' title={set.setItemName}>{set.setItemName}</h4>
                <Badge 
                  variant={getItemRarityVariant(set.setItemRarityName)} 
                  className='mt-1 text-xs'
                >
                  {set.setItemRarityName} 세트
                </Badge>
              </div>
              {set.active && (
                <div className='p-4 text-sm space-y-3'>
                  {set.active.explain && (
                    <div>
                      <h5 className='font-medium text-slate-600 dark:text-slate-300 mb-0.5'>효과 설명:</h5>
                      <p className='whitespace-pre-line text-slate-700 dark:text-slate-200 text-xs leading-relaxed'>{set.active.explain}</p>
                    </div>
                  )}
                  {set.active.buffExplain && (
                    <div>
                      <h5 className='font-medium text-slate-600 dark:text-slate-300 mb-0.5'>버프 효과:</h5>
                      <p className='whitespace-pre-line text-slate-700 dark:text-slate-200 text-xs leading-relaxed'>{set.active.buffExplain}</p>
                    </div>
                  )}
                  {set.active.status && set.active.status.length > 0 && (
                    <div>
                      <h5 className='font-medium text-slate-600 dark:text-slate-300 mb-0.5'>추가 스탯:</h5>
                      <ul className='list-disc list-inside space-y-0.5 pl-1 text-xs'>
                        {set.active.status.map((stat: StatusDetailDTO, i: number) => (
                          <li key={i} className='text-slate-700 dark:text-slate-200'>
                            {stat.name}: <span className='font-semibold'>{String(stat.value)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {set.active.setPoint && (
                    <div>
                      <h5 className='font-medium text-slate-600 dark:text-slate-300 mb-0.5'>세트 포인트:</h5>
                      <p className='text-slate-700 dark:text-slate-200 text-xs'>
                        현재 <span className='font-semibold'>{set.active.setPoint.current}</span> / 최소 {set.active.setPoint.min} / 최대 {set.active.setPoint.max}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
} 