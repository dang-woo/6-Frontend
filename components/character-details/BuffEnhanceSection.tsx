'use client'

import Image from 'next/image'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import type {
  BuffSkillInfoDetailDTO,
  BuffEquipmentDetailDTO,
  BuffAvatarDetailDTO,
  BuffCreatureDetailDTO,
  BuffAvatarEmblemDTO
} from '@/types/dnf'

interface BuffEnhanceSectionProps {
  buffSkill?: {
    skillInfo?: BuffSkillInfoDetailDTO | null
    equipment?: BuffEquipmentDetailDTO[] | null
    avatar?: BuffAvatarDetailDTO[] | null
    creature?: BuffCreatureDetailDTO[] | null
  } | null
}

const getNeopleItemImageUrl = (itemId: string) => {
  return `https://img-api.neople.co.kr/df/items/${itemId}`;
}

const getItemRarityVariant = (
  rarity: string | null | undefined
): 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined => {
  if (!rarity) return 'outline';
  switch (rarity) {
    case '커먼':
    case '언커먼':
      return 'secondary';
    case '레어':
      return 'default';
    case '유니크':
      return 'default';
    case '에픽':
      return 'destructive';
    case '레전더리':
    case '신화':
    case '태초':
      return 'default';
    default:
      return 'outline';
  }
}

export function BuffEnhanceSection ({ buffSkill }: BuffEnhanceSectionProps) {
  if (
    !buffSkill ||
    (!buffSkill.skillInfo &&
      (!buffSkill.equipment || buffSkill.equipment.length === 0) &&
      (!buffSkill.avatar || buffSkill.avatar.length === 0) &&
      (!buffSkill.creature || buffSkill.creature.length === 0))
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>버프 강화 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p>버프 강화 정보가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  const { skillInfo, equipment, avatar, creature } = buffSkill;

  const renderSkillInfoDesc = (desc: string, values: string[]) => {
    if (!desc || !values) return '';
    return desc.replace(/\{value(\d+)\}/g, (match, indexStr) => {
      const index = parseInt(indexStr, 10) - 1;
      const value = values[index];
      if (value !== undefined) {
        return (value === '-' || value.trim() === '') ? '-' : value;
      }
      return match;
    });
  }

  return (
    <Accordion type='multiple' className='w-full space-y-3'>
      {skillInfo && skillInfo.option && (
        <AccordionItem value='buff-skill-info' className='border-none'>
          <Card className='overflow-hidden shadow-md'>
            <CardHeader className='bg-muted/20 p-4'>
              <CardTitle className='text-xl font-bold text-yellow-500 dark:text-yellow-400'>
                {skillInfo.name} (Lv.{skillInfo.option.level})
              </CardTitle>
            </CardHeader>
            {skillInfo.option.desc && (
              <CardContent className='p-4 text-sm'>
                <p className='whitespace-pre-line text-gray-700 dark:text-gray-300'>
                  {renderSkillInfoDesc(skillInfo.option.desc, skillInfo.option.values || [])}
                </p>
              </CardContent>
            )}
          </Card>
        </AccordionItem>
      )}

      {equipment && equipment.length > 0 && (
        <AccordionItem value='buff-equipment' className='border-none'>
          <AccordionTrigger className='text-lg font-semibold p-3 hover:bg-muted/50 rounded-md bg-card border'>
            버프 장비 ({equipment.length})
          </AccordionTrigger>
          <AccordionContent className='pt-3'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
              {equipment.map((item: BuffEquipmentDetailDTO, index: number) => {
                const itemImageUrl = item.itemImage ?? (item.itemId ? getNeopleItemImageUrl(item.itemId) : '/images/placeholder.png')
                return (
                  <Card key={item.itemId || index} className='overflow-hidden'>
                    <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/10'>
                      <div className='relative w-12 h-12 flex-shrink-0'>
                        <Image
                          src={itemImageUrl}
                          alt={item.itemName}
                          fill
                          sizes='48px'
                          className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
                          unoptimized
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-base font-semibold truncate' title={item.itemName}>
                          {item.itemName}
                        </CardTitle>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge variant={getItemRarityVariant(item.itemRarity)} className='text-xs'>
                            {item.itemRarity}
                          </Badge>
                          {item.reinforce !== 0 && (
                            <Badge variant='outline' className='text-xs'>
                              +{item.reinforce} 강화
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {avatar && avatar.length > 0 && (
        <AccordionItem value='buff-avatar' className='border-none'>
          <AccordionTrigger className='text-lg font-semibold p-3 hover:bg-muted/50 rounded-md bg-card border'>
            버프 아바타 ({avatar.length})
          </AccordionTrigger>
          <AccordionContent className='pt-3'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {avatar.map((item: BuffAvatarDetailDTO, index: number) => {
                const itemImageUrl = item.itemImage ?? (item.itemId ? getNeopleItemImageUrl(item.itemId) : '/images/placeholder.png')
                return (
                  <Card key={item.itemId || index} className='overflow-hidden flex flex-col'>
                    <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/10'>
                      <div className='relative w-12 h-12 flex-shrink-0'>
                        <Image
                          src={itemImageUrl}
                          alt={item.itemName}
                          fill
                          sizes='48px'
                          className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
                          unoptimized
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-base font-semibold truncate' title={item.itemName}>
                          {item.itemName}
                          {item.clone?.itemName && <span className='text-sm text-muted-foreground'> ({item.clone.itemName})</span>}
                        </CardTitle>
                        <Badge variant={getItemRarityVariant(item.itemRarity)} className='mt-1 text-xs'>
                          {item.itemRarity}
                        </Badge>
                      </div>
                    </CardHeader>
                    {(item.optionAbility || (item.emblems && item.emblems.length > 0)) && (
                      <CardContent className='p-3 flex-grow text-xs'>
                        {item.optionAbility && (
                          <p className='mb-1.5'>
                            <span className='font-medium text-muted-foreground'>옵션: </span>
                            {item.optionAbility}
                          </p>
                        )}
                        {item.emblems && item.emblems.length > 0 && (
                          <div>
                            <h5 className='font-medium text-muted-foreground mb-1'>엠블렘:</h5>
                            <div className='space-y-1'>
                              {item.emblems.map((emblem: BuffAvatarEmblemDTO, i: number) => (
                                <div key={i} className='flex items-center gap-1.5'>
                                  <Badge variant={getItemRarityVariant(emblem.itemRarity)} className='text-[10px] leading-tight px-1 py-0'>
                                    {emblem.itemRarity}
                                  </Badge>
                                  <span className='text-gray-700 dark:text-gray-300'>{emblem.itemName}</span>
                                  {emblem.slotColor && <span className='text-muted-foreground text-[10px]'>({emblem.slotColor})</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {creature && creature.length > 0 && (
        <AccordionItem value='buff-creature' className='border-none'>
          <AccordionTrigger className='text-lg font-semibold p-3 hover:bg-muted/50 rounded-md bg-card border'>
            버프 크리쳐 ({creature.length})
          </AccordionTrigger>
          <AccordionContent className='pt-3'>
            {creature.map((item: BuffCreatureDetailDTO, index: number) => {
              const itemImageUrl = item.itemImage ?? (item.itemId ? getNeopleItemImageUrl(item.itemId) : '/images/placeholder.png')
              return (
                <Card key={item.itemId || index} className='overflow-hidden not-last:mb-3'>
                  <CardHeader className='flex flex-row items-center gap-3 p-3 bg-muted/10'>
                    <div className='relative w-12 h-12 flex-shrink-0'>
                      <Image
                        src={itemImageUrl}
                        alt={item.itemName}
                        fill
                        sizes='48px'
                        className='rounded-md object-contain bg-gray-100 dark:bg-gray-800 p-0.5 border'
                        unoptimized
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <CardTitle className='text-base font-semibold truncate' title={item.itemName}>
                        {item.itemName}
                      </CardTitle>
                      <Badge variant={getItemRarityVariant(item.itemRarity)} className='mt-1 text-xs'>
                        {item.itemRarity}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  )
} 