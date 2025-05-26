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
  BuffSkillDTO,
  BuffSkillInfoDetailDTO,
  BuffEquipmentDetailDTO,
  BuffAvatarDetailDTO,
  BuffCreatureDetailDTO,
  BuffAvatarEmblemDTO
} from '@/types/dnf'

interface BuffEnhanceSectionProps {
  data: BuffSkillDTO | null | undefined;
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

export function BuffEnhanceSection ({ data }: BuffEnhanceSectionProps) {
  if (
    !data ||
    (!data.skillInfo &&
      (!data.equipment || data.equipment.length === 0) &&
      (!data.avatar || data.avatar.length === 0) &&
      (!data.creature || data.creature.length === 0))
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>버프 강화</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">버프 강화 정보가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  const { skillInfo, equipment, avatar, creature } = data;

  const renderSkillInfoDesc = (desc: string | undefined, values: string[] | undefined) => {
    if (!desc || !values) return '';
    return desc.replace(/\{value(\d+)\}/g, (_match, indexStr) => {
      const index = parseInt(indexStr, 10) - 1;
      const value = values[index];
      return (value !== undefined && value !== '-' && value.trim() !== '') ? value : '-';
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>버프 강화</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type='multiple' defaultValue={['buff-skill-info']} className='w-full space-y-1'>
          {skillInfo && skillInfo.option && (
            <AccordionItem value='buff-skill-info' className='border rounded-md bg-slate-50 dark:bg-slate-800/50'>
              <AccordionTrigger className='text-md font-medium px-4 py-2 hover:no-underline hover:bg-muted/20 rounded-t-md data-[state=closed]:rounded-b-md'>
                {skillInfo.name} (Lv.{skillInfo.option.level})
              </AccordionTrigger>
              <AccordionContent className='p-3 border-t border-gray-200 dark:border-slate-700 text-sm'>
                <p className='whitespace-pre-line text-gray-700 dark:text-gray-300'>
                  {renderSkillInfoDesc(skillInfo.option.desc, skillInfo.option.values)}
                </p>
              </AccordionContent>
            </AccordionItem>
          )}

          {equipment && equipment.length > 0 && (
            <AccordionItem value='buff-equipment' className='border rounded-md bg-slate-50 dark:bg-slate-800/50'>
              <AccordionTrigger className='text-md font-medium px-4 py-2 hover:no-underline hover:bg-muted/20 rounded-t-md data-[state=closed]:rounded-b-md'>
                버프 장비 ({equipment.length})
              </AccordionTrigger>
              <AccordionContent className='p-3 border-t border-gray-200 dark:border-slate-700'>
                <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
                  {equipment.map((item: BuffEquipmentDetailDTO, index: number) => {
                    const itemImageUrl = item.itemImage || (item.itemId ? getNeopleItemImageUrl(item.itemId) : '/images/placeholder.png');
                    return (
                      <li key={item.itemId || `equip-${index}`} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex items-start gap-3 flex-grow">
                          <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                            <Image
                              src={itemImageUrl}
                              alt={item.itemName}
                              width={48} height={48} className='object-contain p-0.5'
                              unoptimized={!itemImageUrl.startsWith('/')}
                              onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div>
                              <h4 className="text-md font-semibold truncate" title={item.itemName}>{item.itemName}</h4>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                                <Badge variant={getItemRarityVariant(item.itemRarity)} className='text-[10px] px-1 py-0 font-normal h-auto align-middle'>{item.itemRarity}</Badge>
                                {item.reinforce !== 0 && (
                                  <Badge variant='outline' className='text-[10px] px-1 py-0 font-normal ml-1 h-auto align-middle'>+{item.reinforce} 강화</Badge>
                                )}
                              </div>
                            </div>
                            {item.setItemName && <p className="text-xs text-muted-foreground mt-1 truncate">세트: {item.setItemName}</p>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {avatar && avatar.length > 0 && (
            <AccordionItem value='buff-avatar' className='border rounded-md bg-slate-50 dark:bg-slate-800/50'>
              <AccordionTrigger className='text-md font-medium px-4 py-2 hover:no-underline hover:bg-muted/20 rounded-t-md data-[state=closed]:rounded-b-md'>
                버프 아바타 ({avatar.length})
              </AccordionTrigger>
              <AccordionContent className='p-3 border-t border-gray-200 dark:border-slate-700'>
                <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
                  {avatar.map((item: BuffAvatarDetailDTO, index: number) => {
                    const itemImageUrl = item.itemImage || (item.itemId ? getNeopleItemImageUrl(item.itemId) : '/images/placeholder.png');
                    return (
                      <li key={item.itemId || `avatar-${index}`} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex items-start gap-3 flex-grow">
                          <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                            <Image
                              src={itemImageUrl}
                              alt={item.itemName}
                              width={48} height={48} className='object-contain p-0.5'
                              unoptimized={!itemImageUrl.startsWith('/')}
                              onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div>
                              <h4 className="text-md font-semibold truncate" title={item.itemName}>
                                {item.itemName}
                                {item.clone?.itemName && <span className='text-sm text-muted-foreground'> ({item.clone.itemName})</span>}
                              </h4>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                                <Badge variant={getItemRarityVariant(item.itemRarity)} className='text-[10px] px-1 py-0 font-normal h-auto align-middle'>{item.itemRarity}</Badge>
                              </div>
                            </div>
                            <div className="mt-1 space-y-0.5 text-xs">
                              {item.optionAbility && <p className="truncate"><span className='font-medium text-muted-foreground'>옵션: </span>{item.optionAbility}</p>}
                              {item.emblems && item.emblems.length > 0 && (
                                <div className="mt-1">
                                  <h5 className='font-medium text-muted-foreground mb-0.5'>엠블렘:</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {item.emblems.map((emblem: BuffAvatarEmblemDTO, i: number) => (
                                      <Badge key={i} variant={getItemRarityVariant(emblem.itemRarity)} title={`${emblem.itemName} (${emblem.slotColor || ''})`} className='text-[10px] px-1 py-0 font-normal h-auto align-middle'>
                                        {emblem.itemName}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {creature && creature.length > 0 && (
            <AccordionItem value='buff-creature' className='border rounded-md bg-slate-50 dark:bg-slate-800/50'>
              <AccordionTrigger className='text-md font-medium px-4 py-2 hover:no-underline hover:bg-muted/20 rounded-t-md data-[state=closed]:rounded-b-md'>
                버프 크리쳐 ({creature.length})
              </AccordionTrigger>
              <AccordionContent className='p-3 border-t border-gray-200 dark:border-slate-700'>
                <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
                  {creature.map((item: BuffCreatureDetailDTO, index: number) => {
                    const itemImageUrl = item.itemImage || (item.itemId ? getNeopleItemImageUrl(item.itemId) : '/images/placeholder.png');
                    return (
                      <li key={item.itemId || `creature-${index}`} className="border rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex items-start gap-3 flex-grow">
                           <div className="relative w-12 h-12 flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                            <Image
                              src={itemImageUrl}
                              alt={item.itemName}
                              width={48} height={48} className='object-contain p-0.5'
                              unoptimized={!itemImageUrl.startsWith('/')}
                              onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div>
                              <h4 className="text-md font-semibold truncate" title={item.itemName}>{item.itemName}</h4>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                                <Badge variant={getItemRarityVariant(item.itemRarity)} className='text-[10px] px-1 py-0 font-normal h-auto align-middle'>{item.itemRarity}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
} 