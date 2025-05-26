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

const tabItems = [
  { value: 'equipment', label: '장비', icon: ShieldCheck, component: EquipmentSection, dataKey: 'equipment' },
  { value: 'avatar', label: '아바타', icon: Sparkles, component: AvatarSection, dataKey: 'avatar' },
  { value: 'creature', label: '크리쳐', icon: Gem, component: CreatureSection, dataKey: 'creature' },
  { value: 'talisman', label: '탈리스만', icon: Swords, component: TalismanSection, dataKey: 'talismans' },
  { value: 'skillStyle', label: '스킬 스타일', icon: ScrollText, component: SkillStyleSection, dataKey: 'skill.style' },
  { value: 'buffEnhance', label: '버프 강화', icon: Star, component: BuffEnhanceSection, dataKey: 'skill.buff' },
  { value: 'setItem', label: '세트', icon: SquareStack, component: SetItemSection, dataKey: 'setItemInfo' },
  { value: 'flag', label: '휘장', icon: FlagIcon, component: FlagSection, dataKey: 'flag' },
];

export function CharacterTabs({ character }: CharacterTabsProps) {
  // dataKey를 통해 character 객체에서 안전하게 데이터를 가져오는 헬퍼 함수
  const getSafeData = (object: any, path: string) => {
    if (!path) return object; // path가 비어있으면 object 자체를 반환 (일부 섹션은 전체 character 객체가 필요할 수 있음)
    return path.split('.').reduce((acc, part) => acc && acc[part], object);
  };

  return (
    <Tabs defaultValue="equipment" className="w-full mt-6">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-8 mb-6 h-auto flex-wrap">
        {tabItems.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="py-2 text-xs sm:text-sm">
            <tab.icon className="w-4 h-4 mr-1 sm:mr-2" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabItems.map((tab) => {
        const SectionComponent = tab.component as any; // 타입 단언
        const sectionData = getSafeData(character, tab.dataKey);
        // console.log(`Rendering tab: ${tab.value}, dataKey: ${tab.dataKey}, sectionData:`, sectionData); // 데이터 확인용 로그
        return (
          <TabsContent key={tab.value} value={tab.value}>
            {/* 
              섹션 데이터가 없는 경우를 고려하여 렌더링할 수 있습니다.
              예: if (!sectionData && tab.dataKey) { // dataKey가 있는 경우에만 데이터 없음 메시지 표시
                     return <p className="text-center py-4">{tab.label} 정보가 없습니다.</p>;
                   }
            */}
            <SectionComponent data={sectionData} />
          </TabsContent>
        );
      })}
    </Tabs>
  );
} 