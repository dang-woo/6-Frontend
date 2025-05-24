// DNF API 관련 타입 정의

// 최상위 캐릭터 상세 정보 응답 DTO
export interface DFCharacterResponseDTO {
  characterId: string;
  characterName: string;
  level: number;
  jobId: string;
  jobGrowId: string;
  imageUrl: string;
  serverId: string;
  adventureName: string | null;
  guildName: string | null;
  jobName: string;
  jobGrowName: string;
  fame: string; // API 응답은 문자열이지만, 숫자형으로 파싱해서 사용할 수 있음
  lastUpdated: number[] | string | Date; // 다양한 형식을 수용 (예시: [2025, 5, 24, ...])
  equipment: EquipmentDTO[];
  setItemInfo: SetItemInfoDTO[];
  avatar: AvatarDTO[];
  creature: CreatureDTO | null;
  flag: FlagDTO | null;
  talismans: TalismansDTO[];
  skill: SkillDTO | null;

}

// 장비 (Equipment)
export interface EquipmentDTO {
  slotName: string;
  itemId: string;
  itemImage: string;
  itemName: string;
  itemRarity: string;
  setItemName: string | null;
  reinforce: string; // 예: "13"
  itemGradeName: string | null;
  enchant: EnchantDTO | null;
  amplificationName: string | null;
  fusionOption: FusionOptionDTO | null;
  tune: TuneDTO[] | null;
  upgradeInfo: UpgradeInfoDTO | null;
}

export interface EnchantDTO {
  status: StatusDetailDTO[];
}

export interface StatusDetailDTO {
  name: string;
  value: string | number; // 값이 문자열 또는 숫자일 수 있음
}

export interface FusionOptionDTO {
  options: FusionOptionDetailDTO[];
}

export interface FusionOptionDetailDTO {
  buff: number | null;
  explain: string | null;
  engrave: { value: string } | null; // aa.txt에서는 engrave가 null이었음
}

export interface TuneDTO {
  level: string;
  setPoint: number | null;
  upgrade: string | null; // "false" 같은 문자열 또는 boolean
  status: StatusDetailDTO[] | null;
}

export interface UpgradeInfoDTO {
  itemName: string;
  itemRarity: string;
  setItemName: string | null;
  setPoint: number | null;
}

// 세트 아이템 정보 (SetItemInfo)
export interface SetItemInfoDTO {
  setItemName: string;
  setItemRarityName: string;
  active: SetItemActiveDTO | null;
}

export interface SetItemActiveDTO {
  explain: string | null;
  buffExplain: string | null;
  status: StatusDetailDTO[];
  setPoint: {
    current: number;
    min: number;
    max: number;
  } | null;
}

// 아바타 (Avatar)
export interface AvatarDTO {
  itemId: string;
  itemImage: string;
  slotName: string;
  itemRarity: string;
  itemName: string;
  clone: { itemName: string | null } | null;
  optionAbility: string | null;
  emblems: EmblemDTO[] | null;
}

export interface EmblemDTO {
  slotNo: number;
  itemName: string;
  itemRarity: string;
}

// 크리쳐 (Creature)
export interface CreatureDTO {
  itemId: string;
  itemImage: string;
  itemName: string;
  itemRarity: string;
  artifact: ArtifactDTO[] | null;
}

export interface ArtifactDTO {
  itemId: string;
  itemImage: string;
  itemName: string;
  itemAvailableLevel: number | null;
  itemRarity: string;
}

// 휘장 (Flag)
export interface FlagDTO {
  itemId: string;
  itemImage: string;
  itemName: string;
  itemRarity: string;
  reinforce: number;
  reinforceStatus: ReinforceStatusDTO[] | null;
  gems: GemDTO[] | null;
}

export interface ReinforceStatusDTO {
  name: string;
  value: number;
}

export interface GemDTO {
  itemId: string;
  itemImage: string;
  slotNo: number;
  itemName: string;
  itemRarity: string;
}

// 탈리스만 (Talismans)
export interface TalismansDTO {
  talisman: TalismanDetailDTO | null;
  runes: RuneDTO[] | null;
}

export interface TalismanDetailDTO {
  itemId: string;
  itemImage: string;
  slotNo: number;
  itemName: string;
  runeTypes: string[] | null; // 예시에서는 string 배열이었음
}

export interface RuneDTO {
  itemId: string;
  itemImage: string;
  slotNo: number;
  itemName: string;
  // aa.txt 예시에는 없었지만, itemRarity가 있을 수 있음
}

// 스킬 (Skill)
export interface SkillDTO {
  style: SkillStyleDTO | null;
  buff: BuffSkillDTO | null;
}

export interface SkillStyleDTO {
  active: SkillInfoDTO[] | null;
  passive: SkillInfoDTO[] | null;
}

export interface SkillInfoDTO {
  name: string;
  level: number;
  costType: string; // "SP" 등
}

export interface BuffSkillDTO {
  skillInfo: BuffSkillInfoDetailDTO | null;
  equipment: BuffEquipmentDetailDTO[] | null;
  avatar: BuffAvatarDetailDTO[] | null;
  creature: BuffCreatureDetailDTO[] | null;
}

export interface BuffSkillInfoDetailDTO {
  name: string;
  option: {
    level: number;
    desc: string;
    values: string[];
  } | null;
}

export interface BuffEquipmentDetailDTO {
  slotName: string;
  itemId: string;
  itemImage: string | null; // aa.txt 예시에서 null 값 확인
  itemName: string;
  itemType: string;
  itemTypeDetail: string;
  itemAvailableLevel: number;
  itemRarity: string;
  setItemName: string | null;
  reinforce: number;
  amplificationName: string | null;
  refine: number;
}

export interface BuffAvatarDetailDTO {
  slotName: string;
  itemId: string;
  itemImage: string | null;
  itemName: string;
  itemRarity: string;
  clone: { itemName: string | null } | null;
  optionAbility: string | null;
  emblems: BuffAvatarEmblemDTO[] | null;
}

export interface BuffAvatarEmblemDTO {
  slotNo: number;
  slotColor: string; // 예시: "플래티넘"
  itemName: string;
  itemRarity: string;
}

export interface BuffCreatureDetailDTO {
  itemId: string;
  itemImage: string | null;
  itemName: string;
  itemRarity: string;
}

// MainSearchForm.tsx 에서 사용된 검색 결과 관련 타입도 여기에 포함 가능
export interface CharacterSearchResult {
  serverId: string;
  characterId: string;
  characterName: string;
  level: number;
  jobId: string;
  jobGrowId: string;
  jobName: string;
  jobGrowName: string;
  fame: number; // 실제 API 응답은 숫자일 수 있으나, DFCharacterResponseDTO의 fame과 일관성 유지 또는 변환 필요
  imageUrl: string;
  adventureName?: string | null;
}

export interface CharacterSearchResponse {
  rows: CharacterSearchResult[];
}

export interface ServerOption {
  value: string;
  label: string;
}

// 마이페이지 캐릭터 목록 조회 응답 타입 (CharacterRegist 엔티티 기반)
export interface CharacterRegist {
  id?: number; // DB primary key, optional
  userId: string; // 이 필드는 프론트엔드에서 직접 사용할 일은 없을 수 있음
  characterId: string;
  characterName: string;
  serverId: string;
  adventureName: string | null;
  createdAt?: string; // LocalDateTime -> string or Date
  // CharacterSearchResult 와 유사하게 만들기 위해 추가될 수 있는 필드들
  level?: number; 
  jobGrowName?: string;
  imageUrl?: string;
  // 필요시 다른 필드도 추가 가능
} 