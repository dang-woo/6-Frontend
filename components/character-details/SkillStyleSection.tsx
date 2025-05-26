'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type { SkillStyleDTO, SkillInfoDTO } from '@/types/dnf'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
// import Image from 'next/image' // 스킬 아이콘 이미지가 API에 있다면 사용

interface SkillStyleSectionProps {
  data: SkillStyleDTO | null | undefined; // 'data' prop으로 변경
}

// 스킬 아이콘 URL 생성 함수 (API 응답에 따라 수정 필요)
// const getSkillIconUrl = (skillId: string) => {
// return `https://img-api.neople.co.kr/df/skills/${skillId}?zoom=1`
// }

export function SkillStyleSection ({ data }: SkillStyleSectionProps) {
  if (!data || (!data.active?.length && !data.passive?.length)) { // active/passive가 빈 배열일 경우도 고려
    return (
      <Card> {/* 전체를 Card로 감싸서 통일성 부여 */}
        <CardHeader>
          <CardTitle>스킬 스타일</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">스킬 스타일 정보가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  const renderSkillList = (skills: SkillInfoDTO[] | null | undefined, typeLabel: string) => {
    if (!skills || skills.length === 0) {
      // 이 경우는 상위에서 이미 체크하므로, 실제로는 거의 호출되지 않을 수 있음
      // 또는 특정 타입(액티브/패시브)만 없을 때를 위해 남겨둘 수 있음
      return <p className="px-3 py-2 text-sm text-muted-foreground">{typeLabel} 정보가 없습니다.</p>;
    }
    return (
      // ul > li 구조로 변경하여 다른 섹션과 통일성 시도
      <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
        {skills.map((skill, index) => (
          <li key={`${typeLabel}-${skill.name}-${index}`} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start gap-3 flex-grow">
              {/* 스킬 아이콘이 있다면 여기에 이미지 영역 (현재는 없음) */}
              {/* <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600"> ICON </div> */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div>
                  <h4 className="text-md font-semibold truncate" title={skill.name}> 
                    {skill.name}
                  </h4>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                    <Badge variant='secondary' className='text-[10px] px-1 py-0 font-normal h-auto align-middle'>Lv. {skill.level}</Badge>
                    {skill.costType && (
                      <Badge variant='outline' className='text-[10px] px-1 py-0 font-normal ml-1 h-auto align-middle'>{skill.costType}</Badge>
                    )}
                  </div>
                </div>
                {/* 스킬 설명 등 추가 정보가 있다면 여기에 표시 */}
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card> {/* 전체를 Card로 감싸서 제목 등을 표시 */}
      <CardHeader>
        <CardTitle>스킬 스타일</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type='multiple' defaultValue={['active-skills', 'passive-skills']} className='w-full space-y-1'>
          {data.active && data.active.length > 0 && (
            <AccordionItem value='active-skills' className='border rounded-md bg-slate-50 dark:bg-slate-800/50'>
              <AccordionTrigger className='text-md font-medium px-4 py-2 hover:no-underline hover:bg-muted/20 rounded-t-md data-[state=closed]:rounded-b-md'>
                액티브 스킬 ({data.active.length})
              </AccordionTrigger>
              <AccordionContent className='p-3 border-t border-gray-200 dark:border-slate-700'>
                {renderSkillList(data.active, '액티브 스킬')}
              </AccordionContent>
            </AccordionItem>
          )}
          {data.passive && data.passive.length > 0 && (
            <AccordionItem value='passive-skills' className='border rounded-md bg-slate-50 dark:bg-slate-800/50'>
              <AccordionTrigger className='text-md font-medium px-4 py-2 hover:no-underline hover:bg-muted/20 rounded-t-md data-[state=closed]:rounded-b-md'>
                패시브 스킬 ({data.passive.length})
              </AccordionTrigger>
              <AccordionContent className='p-3 border-t border-gray-200 dark:border-slate-700'>
                {renderSkillList(data.passive, '패시브 스킬')}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
} 