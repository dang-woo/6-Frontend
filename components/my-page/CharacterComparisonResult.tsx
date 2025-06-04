'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ServerOption } from '@/types/dnf'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface Equipment {
  slotName: string
  itemName: string
  itemRarity: string
  reinforce?: string
  itemGradeName?: string
  enchant?: {
    status: Array<{ name: string; value: string }>
  }
}

interface Character {
  characterId: string
  characterName: string
  level: number
  jobName: string
  jobGrowName: string
  serverId: string
  imageUrl?: string
  fame?: string
  adventureName?: string
  guildName?: string
  equipment?: Equipment[]
  creatureName?: string
  titleName?: string
  auraName?: string
}

interface CharacterAuction {
  creaturePrice?: number
  titlePrice?: number
  auraPrice?: number
}

interface ComparisonData {
  character: Character
  characterAuction: CharacterAuction
}

interface CharacterComparisonResultProps {
  comparisonData: ComparisonData[]
  serverOptions: ServerOption[]
}

function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return '정보 없음'
  const numPrice = Number(price)
  if (isNaN(numPrice)) return '가격 정보 없음'
  return numPrice.toLocaleString() + ' 골드'
}

const getServerNameByIdLocal = (serverId: string, serverOptions: ServerOption[]): string => {
  const server = serverOptions.find(option => option.value === serverId)
  return server ? server.label : serverId
}

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case '에픽':
      return 'text-orange-500'
    case '레전더리':
      return 'text-purple-500'
    case '레어':
      return 'text-blue-500'
    case '유니크':
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
}

export function CharacterComparisonResult({ comparisonData, serverOptions }: CharacterComparisonResultProps) {
  if (!comparisonData || comparisonData.length === 0) {
    return <p className="text-center text-muted-foreground">캐릭터 비교 데이터를 불러올 수 없습니다.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6">
      {comparisonData.map((data, index) => (
        <Card key={data.character.characterId || index} className="overflow-hidden">
          <Link 
            href={`/character/${data.character.serverId}/${data.character.characterId}`}
            className="relative aspect-[2/1] overflow-hidden block group"
          >
            {data.character.imageUrl ? (
              <Image
                src={data.character.imageUrl}
                alt={data.character.characterName}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                priority={false}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">이미지 없음</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-4">
              <h3 className="text-base sm:text-xl font-bold text-white truncate">
                {data.character.characterName}
              </h3>
              <p className="text-xs sm:text-sm text-white/90">
                Lv.{data.character.level} {data.character.jobGrowName}
              </p>
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm sm:text-base font-medium">상세정보 보기</span>
            </div>
          </Link>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-1 sm:px-4">개요</TabsTrigger>
              <TabsTrigger value="equipment" className="text-xs sm:text-sm px-1 sm:px-4">장비</TabsTrigger>
              <TabsTrigger value="auction" className="text-xs sm:text-sm px-1 sm:px-4">가격</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-2 sm:p-4 space-y-2 sm:space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">서버</span>
                  <span className="font-medium">{getServerNameByIdLocal(data.character.serverId, serverOptions)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">직업</span>
                  <span className="font-medium">{data.character.jobName}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">전직</span>
                  <span className="font-medium">{data.character.jobGrowName}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">모험단</span>
                  <span className="font-medium">{data.character.adventureName || '-'}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">길드</span>
                  <span className="font-medium">{data.character.guildName || '-'}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">명성</span>
                  <span className="font-medium">{data.character.fame || '0'}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="p-2 sm:p-4">
              <ScrollArea className="h-[200px] sm:h-[300px]">
                <div className="space-y-2 sm:space-y-3">
                  {data.character.equipment?.map((equip, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">{equip.slotName}</span>
                        <span className={`font-medium ${getRarityColor(equip.itemRarity)}`}>
                          {equip.itemName}
                          {equip.reinforce && equip.reinforce !== '0' && (
                            <span className="ml-1 text-primary">+{equip.reinforce}</span>
                          )}
                        </span>
                      </div>
                      {equip.itemGradeName && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {equip.itemGradeName}
                        </Badge>
                      )}
                      {equip.enchant?.status && (
                        <div className="pl-2 sm:pl-4 space-y-0.5">
                          {equip.enchant.status.map((stat, statIdx) => (
                            <div key={statIdx} className="text-[10px] sm:text-xs text-muted-foreground flex justify-between">
                              <span>{stat.name}</span>
                              <span>{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {idx < (data.character.equipment?.length || 0) - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="auction" className="p-2 sm:p-4 space-y-2 sm:space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">칭호</span>
                  <div className="text-right">
                    <span className="font-medium">{data.character.titleName || '-'}</span>
                    <span className="block text-[10px] sm:text-xs text-muted-foreground">
                      {formatPrice(data.characterAuction.titlePrice)}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">오라</span>
                  <div className="text-right">
                    <span className="font-medium">{data.character.auraName || '-'}</span>
                    <span className="block text-[10px] sm:text-xs text-muted-foreground">
                      {formatPrice(data.characterAuction.auraPrice)}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">크리쳐</span>
                  <div className="text-right">
                    <span className="font-medium">{data.character.creatureName || '-'}</span>
                    <span className="block text-[10px] sm:text-xs text-muted-foreground">
                      {formatPrice(data.characterAuction.creaturePrice)}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      ))}
    </div>
  )
} 