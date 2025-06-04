'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ServerOption } from '@/types/dnf'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {comparisonData.map((data, index) => (
        <Card key={data.character.characterId || index} className="h-full flex flex-col border">
          <CardHeader className="p-0 relative aspect-square overflow-hidden rounded-t-md">
            {data.character.imageUrl ? (
              <Image
                src={data.character.imageUrl}
                alt={data.character.characterName}
                width={180}
                height={180}
                className="object-cover w-full h-full"
                priority={false}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground rounded-t-md text-xs sm:text-sm">
                이미지 없음
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4 flex-grow flex flex-col gap-4">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-xl font-semibold truncate" title={data.character.characterName}>
                {data.character.characterName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Lv.{data.character.level} {data.character.jobGrowName}
                <span className="text-xs ml-2">({data.character.jobName})</span>
              </p>
              <p className="text-sm text-muted-foreground">
                서버: {getServerNameByIdLocal(data.character.serverId, serverOptions)}
              </p>
              <p className="text-sm text-muted-foreground">
                모험단: {data.character.adventureName || '-'}
              </p>
              <p className="text-sm text-muted-foreground">
                길드: {data.character.guildName || '-'}
              </p>
            </div>

            {/* 장비 정보 */}
            {data.character.equipment && data.character.equipment.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">주요 장비</h4>
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  <div className="space-y-2">
                    {data.character.equipment.map((equip, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{equip.slotName}:</span>
                          <span className={getRarityColor(equip.itemRarity)}>
                            {equip.itemName}
                            {equip.reinforce && equip.reinforce !== '0' && ` +${equip.reinforce}`}
                          </span>
                        </div>
                        {equip.itemGradeName && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {equip.itemGradeName}
                          </Badge>
                        )}
                        {equip.enchant?.status && (
                          <div className="ml-4 text-xs text-muted-foreground">
                            {equip.enchant.status.map((stat, statIdx) => (
                              <div key={statIdx}>
                                {stat.name}: {stat.value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* 가격 정보 */}
            <div>
              <h4 className="font-semibold mb-2">아이템 가격</h4>
              <div className="space-y-1">
                <p className="text-sm">
                  칭호: {formatPrice(data.characterAuction.titlePrice)}
                </p>
                <p className="text-sm">
                  오라: {formatPrice(data.characterAuction.auraPrice)}
                </p>
                <p className="text-sm">
                  크리쳐: {formatPrice(data.characterAuction.creaturePrice)}
                </p>
              </div>
            </div>

            {/* 명성 */}
            <p className="text-sm text-muted-foreground mt-auto">
              명성: {data.character.fame || '정보 없음'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 