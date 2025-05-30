import { DFCharacterResponseDTO } from '@/types/dnf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, Sparkles, Gem, Swords, ScrollText, SquareStack, FlagIcon, Star } from "lucide-react"

// 섹션 컴포넌트 임포트
import { EquipmentSection } from '@/components/character-details/EquipmentSection';
import { AvatarSection } from '@/components/character-details/AvatarSection';
import { CreatureSection } from '@/components/character-details/CreatureSection';
import { TalismanSection } from '@/components/character-details/TalismanSection';
import { SkillStyleSection } from '@/components/character-details/SkillStyleSection';
import { BuffEnhanceSection } from '@/components/character-details/BuffEnhanceSection';
import { SetItemSection } from '@/components/character-details/SetItemSection';
import { FlagSection } from '@/components/character-details/FlagSection';

interface CharacterTabsProps {
  character: DFCharacterResponseDTO;
}

// getNestedData 함수의 예시 (실제 프로젝트의 구현을 따라야 함)
// 이 함수가 다른 곳에 정의되어 있다면, 그 정의를 사용해야 합니다.
// 간단한 예시로 포함합니다.
const getNestedData = (obj: any, path: string) => {
  if (!path) return undefined;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const tabItems = [
  { value: 'equipment', label: '장비', icon: ShieldCheck, component: EquipmentSection, dataKey: 'equipment' },
  { value: 'avatar', label: '아바타', icon: Sparkles, component: AvatarSection, dataKey: 'avatar' },
  { value: 'creature', label: '크리쳐', icon: Gem, component: CreatureSection, dataKey: 'creature' },
  // TalismanSection은 dataKey를 사용하지 않고 serverId, characterId를 직접 받음
  { value: 'talisman', label: '탈리스만', icon: Swords, component: TalismanSection, dataKey: null }, 
  { value: 'skillStyle', label: '스킬 스타일', icon: ScrollText, component: SkillStyleSection, dataKey: 'skill.style' },
  { value: 'buffEnhance', label: '버프 강화', icon: Star, component: BuffEnhanceSection, dataKey: 'skill.buff' },
  { value: 'setItem', label: '세트', icon: SquareStack, component: SetItemSection, dataKey: 'setItemInfo' },
  { value: 'flag', label: '휘장', icon: FlagIcon, component: FlagSection, dataKey: 'flag' },
];

export function CharacterTabs({ character }: CharacterTabsProps) {
  if (!character) {
    // character prop이 없는 경우에 대한 방어 코드 (필요에 따라 추가)
    return <div>캐릭터 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <Tabs defaultValue="equipment" className="w-full">
      <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
        {tabItems.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="text-xs md:text-sm">
            <tab.icon className="w-4 h-4 mr-1 md:w-5 md:h-5" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabItems.map((tab) => {
        const SectionComponent = tab.component as React.ElementType;
        
        return (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.value === 'talisman' ? (
              <SectionComponent 
                serverId={character.serverId} 
                characterId={character.characterId} 
              />
            ) : (
              // dataKey가 null이나 undefined가 아닐 경우에만 getNestedData 호출
              tab.dataKey ? <SectionComponent data={getNestedData(character, tab.dataKey)} /> : <SectionComponent />
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
} 