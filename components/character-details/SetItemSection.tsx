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
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (!rarity) return 'outline';

  // 순서는 중요하지 않으나, 명확성을 위해 주요 레어리티부터 확인
  if (rarity.includes('태초')) return 'default';
  if (rarity.includes('에픽')) return 'default'; // 기존 'destructive'에서 변경
  if (rarity.includes('레전더리')) return 'default';
  if (rarity.includes('유니크')) return 'default';
  if (rarity.includes('레어')) return 'default';
  
  if (rarity.includes('커먼') || rarity.includes('언커먼')) return 'secondary';

  return 'outline'; // 기본값
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
          {data.map((set, index) => {
            let setNameColorClass = 'text-slate-800 dark:text-slate-100'; // 기본값
            if (set.setItemRarityName.includes('태초')) {
                setNameColorClass = 'text-blue-500 dark:text-blue-400';
            } else if (set.setItemRarityName.includes('에픽')) {
              setNameColorClass = 'text-yellow-500 dark:text-yellow-400';
            } else if (set.setItemRarityName.includes('레전더리')) {
              setNameColorClass = 'text-orange-500 dark:text-orange-400';
            } else if (set.setItemRarityName.includes('유니크')) {
              setNameColorClass = 'text-pink-500 dark:text-pink-400';
            } else if (set.setItemRarityName.includes('레어')) {
              setNameColorClass = 'text-purple-500 dark:text-purple-400';
            }

            return (
              <li key={set.setItemName || `set-${index}`} className="border rounded-lg shadow-sm overflow-hidden bg-white dark:bg-slate-800">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <h4 className={`text-lg font-semibold ${setNameColorClass}`} title={set.setItemName}>{set.setItemName}</h4>
                  <Badge 
                    variant={getItemRarityVariant(set.setItemRarityName) || 'default'}
                    className='mt-1 text-xs'
                  >
                    {set.setItemRarityName} 세트
                  </Badge>
                </div>
                {set.active && (
                  <div className='p-4 text-sm space-y-3'>
                    {set.active.explain && (
                      <div>
                        <h5 className='font-medium text-slate-600 dark:text-slate-300 mb-1'>효과 설명:</h5>
                        <p className='whitespace-pre-line text-slate-700 dark:text-slate-200 text-sm leading-relaxed'>{set.active.explain}</p>
                      </div>
                    )}
                    {set.active.buffExplain && (
                      <div className="mt-2">
                        <h5 className='font-medium text-slate-600 dark:text-slate-300 mb-1'>버프 효과:</h5>
                        <p className='whitespace-pre-line text-slate-700 dark:text-slate-200 text-sm leading-relaxed'>{set.active.buffExplain}</p>
                      </div>
                    )}
                    {set.active.status && set.active.status.length > 0 && (
                      <div className="mt-2">
                        <h5 className='font-medium text-slate-600 dark:text-slate-300 mb-1'>추가 스탯:</h5>
                        <ul className='list-disc list-inside space-y-1 pl-1 text-sm'>
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
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
} 