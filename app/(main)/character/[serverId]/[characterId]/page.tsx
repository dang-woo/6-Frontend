import { DFCharacterResponseDTO } from '@/types/dnf';
import { cookies } from 'next/headers'
import { getCharacterDetails } from '@/lib/services/characterService';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CharacterTabs } from '@/components/character-details/CharacterTabs';
import { OverviewSection } from '@/components/character-details/OverviewSection';
import { FloatingChatButton } from '@/components/character-details/FloatingChatButton';

interface CharacterDetailPageProps {
  params: Promise<{
    serverId: string;
    characterId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CharacterDetailPage({ params, searchParams: _searchParams }: CharacterDetailPageProps) {
  const { serverId, characterId } = await params;
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value;
  const isLoggedIn = !!accessToken;
  
  if (!characterId || typeof characterId !== 'string' || characterId.trim() === '') {
    return (
      <ErrorAlert 
        title="잘못된 요청"
        description="캐릭터 ID가 올바르지 않습니다."
      />
    );
  }

  const character = await getCharacterDetails(serverId, characterId);

  if (!character) {
    return (
      <ErrorAlert 
        title="데이터 조회 실패"
        description="캐릭터 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주시거나, 입력 정보를 확인해주세요."
      />
    );
  }

  return (
    <div className="px-1 sm:px-2 py-6 w-full max-w-6xl mx-auto relative">
      <OverviewSection character={character} serverId={serverId} />
      <CharacterTabs character={character} />
      {isLoggedIn && <FloatingChatButton characterId={characterId} />}
    </div>
  );
} 