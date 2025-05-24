import { DFCharacterResponseDTO } from '@/types/dnf';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, ShieldCheck, Sparkles, Gem, Swords, ScrollText, SquareStack, FlagIcon, Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 섹션 컴포넌트 임포트
import { EquipmentSection } from '@/components/character-details/EquipmentSection';
import { AvatarSection } from '@/components/character-details/AvatarSection';
import { CreatureSection } from '@/components/character-details/CreatureSection';
import { TalismanSection } from '@/components/character-details/TalismanSection';
import { SkillStyleSection } from '@/components/character-details/SkillStyleSection';
import { BuffEnhanceSection } from '@/components/character-details/BuffEnhanceSection';
import { SetItemSection } from '@/components/character-details/SetItemSection';
import { FlagSection } from '@/components/character-details/FlagSection';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function getCharacterDetails(serverId: string, characterId: string): Promise<DFCharacterResponseDTO | null> {
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not configured');
    return null;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/df/character?server=${serverId}&characterId=${characterId}`);
    if (!res.ok) {
      console.error(`Failed to fetch character details: ${res.status} ${res.statusText}`);
      const errorBody = await res.text();
      console.error(`Error body: ${errorBody}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching character details:', error);
    return null;
  }
}

interface CharacterDetailPageProps {
  params: Promise<{
    serverId: string;
    characterId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 기본 정보 섹션 (개요) - 페이지 상단에 항상 표시됨
function OverviewSection({ character, serverId }: { character: DFCharacterResponseDTO; serverId: string }) {
  const lastUpdatedString = Array.isArray(character.lastUpdated)
    ? new Date(character.lastUpdated[0], character.lastUpdated[1] - 1, character.lastUpdated[2], character.lastUpdated[3], character.lastUpdated[4], character.lastUpdated[5]).toLocaleString()
    : character.lastUpdated ? new Date(String(character.lastUpdated)).toLocaleString() : '정보 없음';

  return (
    <Card className="overflow-hidden mb-6 shadow-lg">
      <CardHeader className="bg-muted/30 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {character.imageUrl && (
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0">
              <Image
                src={character.imageUrl}
                alt={character.characterName}
                fill
                sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                className="rounded-lg border bg-card object-cover aspect-square shadow-md"
                priority
                unoptimized
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">{character.characterName}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground mt-1">
              Lv.{character.level} {character.jobGrowName} <span className="text-sm sm:text-base">({character.jobName})</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
              <Badge variant="secondary" className="text-xs sm:text-sm">서버: {serverId}</Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">모험단: {character.adventureName || '-'}</Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">길드: {character.guildName || '-'}</Badge>
            </div>
            <p className="text-xl sm:text-2xl font-semibold mt-3 sm:mt-4">명성: <span className="text-amber-500">{character.fame || '정보 없음'}</span></p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 text-foreground/80">추가 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
          <p><strong className="font-medium text-muted-foreground">최근 업데이트:</strong> {lastUpdatedString}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function CharacterDetailPage({ params, searchParams: _searchParams }: CharacterDetailPageProps) {
  const { serverId, characterId } = await params;
  
  const character = await getCharacterDetails(serverId, characterId);

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Terminal className="h-5 w-5" />
          <AlertTitle className="text-lg">데이터 조회 실패</AlertTitle>
          <AlertDescription>
            캐릭터 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주시거나, 입력 정보를 확인해주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-1 sm:px-2 py-6 w-full max-w-6xl mx-auto">
      <OverviewSection character={character} serverId={serverId} />

      <Tabs defaultValue="equipment" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-8 mb-6 h-auto flex-wrap">
          <TabsTrigger value="equipment" className="py-2 text-xs sm:text-sm"><ShieldCheck className="w-4 h-4 mr-1 sm:mr-2"/>장비</TabsTrigger>
          <TabsTrigger value="avatar" className="py-2 text-xs sm:text-sm"><Sparkles className="w-4 h-4 mr-1 sm:mr-2"/>아바타</TabsTrigger>
          <TabsTrigger value="creature" className="py-2 text-xs sm:text-sm"><Gem className="w-4 h-4 mr-1 sm:mr-2"/>크리쳐</TabsTrigger>
          <TabsTrigger value="talisman" className="py-2 text-xs sm:text-sm"><Swords className="w-4 h-4 mr-1 sm:mr-2"/>탈리스만</TabsTrigger>
          <TabsTrigger value="skillStyle" className="py-2 text-xs sm:text-sm"><ScrollText className="w-4 h-4 mr-1 sm:mr-2"/>스킬 스타일</TabsTrigger>
          <TabsTrigger value="buffEnhance" className="py-2 text-xs sm:text-sm"><Star className="w-4 h-4 mr-1 sm:mr-2"/>버프 강화</TabsTrigger>
          <TabsTrigger value="setItem" className="py-2 text-xs sm:text-sm"><SquareStack className="w-4 h-4 mr-1 sm:mr-2"/>세트</TabsTrigger>
          <TabsTrigger value="flag" className="py-2 text-xs sm:text-sm"><FlagIcon className="w-4 h-4 mr-1 sm:mr-2"/>휘장</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment">
          <EquipmentSection equipment={character.equipment} />
        </TabsContent>
        <TabsContent value="avatar">
          <AvatarSection avatar={character.avatar} />
        </TabsContent>
        <TabsContent value="creature">
          <CreatureSection creatureData={character.creature} />
        </TabsContent>
        <TabsContent value="talisman">
          <TalismanSection talismans={character.talismans} />
        </TabsContent>
        <TabsContent value="skillStyle">
          <SkillStyleSection skillStyle={character.skill?.style} />
        </TabsContent>
        <TabsContent value="buffEnhance">
          <BuffEnhanceSection buffSkill={character.skill?.buff} />
        </TabsContent>
        <TabsContent value="setItem">
          <SetItemSection setItemInfo={character.setItemInfo} />
        </TabsContent>
        <TabsContent value="flag">
          <FlagSection flagData={character.flag} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 