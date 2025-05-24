'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type { SkillStyleDTO, SkillInfoDTO } from '@/types/dnf' // SkillDTO 대신 SkillStyleDTO
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
// import Image from 'next/image' // 스킬 아이콘 이미지가 API에 있다면 사용

interface SkillStyleSectionProps {
  skillStyle: SkillStyleDTO | null | undefined // undefined 추가
}

// 스킬 아이콘 URL 생성 함수 (API 응답에 따라 수정 필요)
// const getSkillIconUrl = (skillId: string) => {
// return `https://img-api.neople.co.kr/df/skills/${skillId}?zoom=1`
// }

export function SkillStyleSection ({ skillStyle }: SkillStyleSectionProps) {
  if (!skillStyle || (!skillStyle.active && !skillStyle.passive)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>스킬 스타일 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p>스킬 스타일 정보가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  const renderSkillList = (skills: SkillInfoDTO[] | null | undefined, title: string) => {
    if (!skills || skills.length === 0) {
      return (
        <Card className='mt-2'>
          <CardContent className='p-4 text-sm text-muted-foreground'>
            {title} 정보가 없습니다.
          </CardContent>
        </Card>
      )
    }
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {skills.map((skill) => (
          <Card key={skill.name} className='overflow-hidden'>
            <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/10'>
              {/* 스킬 아이콘 API가 있다면 여기에 Image 컴포넌트 추가 */}
              {/* 예시: skill.icon && <div className='relative w-10 h-10'><Image src={getSkillIconUrl(skill.icon)} alt={skill.name} fill sizes='40px' /></div> */}
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-base font-semibold truncate' title={skill.name}>
                  {skill.name}
                </CardTitle>
                <div className='flex items-center gap-2 mt-1'>
                  <Badge variant='secondary' className='text-xs'>Lv. {skill.level}</Badge>
                  {skill.costType && (
                    <Badge variant='outline' className='text-xs'>{skill.costType}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            {/* 스킬 설명 등이 있다면 CardContent에 추가 */}
            {/* <CardContent className='p-3 text-xs'>{skill.description}</CardContent> */}
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Accordion type='multiple' defaultValue={['active-skills', 'passive-skills']} className='w-full space-y-3'>
      {skillStyle.active && skillStyle.active.length > 0 && (
        <AccordionItem value='active-skills' className='border-none'>
          <AccordionTrigger className='text-lg font-semibold p-3 hover:bg-muted/50 rounded-md bg-card border'>
            액티브 스킬 ({skillStyle.active.length})
          </AccordionTrigger>
          <AccordionContent className='pt-3'>
            {renderSkillList(skillStyle.active, '액티브 스킬')}
          </AccordionContent>
        </AccordionItem>
      )}
      {skillStyle.passive && skillStyle.passive.length > 0 && (
        <AccordionItem value='passive-skills' className='border-none'>
          <AccordionTrigger className='text-lg font-semibold p-3 hover:bg-muted/50 rounded-md bg-card border'>
            패시브 스킬 ({skillStyle.passive.length})
          </AccordionTrigger>
          <AccordionContent className='pt-3'>
            {renderSkillList(skillStyle.passive, '패시브 스킬')}
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  )
} 