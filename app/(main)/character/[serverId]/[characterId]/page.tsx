import { DFCharacterResponseDTO } from '@/types/dnf';
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
import { OverviewSection } from '@/components/character-details/OverviewSection';
import { FlagSection } from '@/components/character-details/FlagSection';
import { FloatingChatButton } from '@/components/character-details/FloatingChatButton';

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
    <div className="px-1 sm:px-2 py-6 w-full max-w-6xl mx-auto relative">
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
      
      <FloatingChatButton />
    </div>
  );
} 