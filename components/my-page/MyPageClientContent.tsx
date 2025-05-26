'use client'

import * as React from 'react'
// import { useRouter } from 'next/navigation' // 현재 미사용
import { MyPageHeader } from '@/components/my-page/MyPageHeader'
import { NoCharactersMessage } from '@/components/my-page/NoCharactersMessage'
import { CharacterRegistrationModal } from '@/components/my-page/CharacterRegistrationModal'
import type { CharacterSearchResult, ServerOption } from '@/types/dnf'
import { CharacterCard } from '@/components/search/CharacterCard'
import { Button } from '@/components/ui/button' // 삭제 UI에 사용될 수 있으므로 import 유지
import { useToast } from '@/components/ui/use-toast' // Shadcn UI useToast 임포트

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // API_BASE_URL 정의

// serverOptionsData는 CharacterCard에 prop으로 전달해야 하므로 유지
const serverOptionsData: ServerOption[] = [
  { value: 'all', label: '전체' },
  { value: 'adventure', label: '모험단' },
  { value: 'cain', label: '카인' },
  { value: 'diregie', label: '디레지에' },
  { value: 'siroco', label: '시로코' },
  { value: 'prey', label: '프레이' },
  { value: 'casillas', label: '카시야스' },
  { value: 'hilder', label: '힐더' },
  { value: 'anton', label: '안톤' },
  { value: 'bakal', label: '바칼' }
];

// getServerNameById 함수는 CharacterCard 내부에서 serverOptions를 사용하므로 여기서 필요 없어짐
// const getServerNameById = (serverId: string): string => { ... };

interface MyPageClientContentProps {
  initialCharacters: CharacterSearchResult[];
  userNickname?: string | null; // userNickname prop 추가 (옵셔널)
}

export function MyPageClientContent({ 
  initialCharacters,
  userNickname, // prop 받기
}: MyPageClientContentProps) {
  // const router = useRouter() // 현재 직접 사용되지 않으므로 주석 처리 또는 삭제 가능
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [registeredCharacters, setRegisteredCharacters] = React.useState<CharacterSearchResult[]>(initialCharacters)
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedCharacters, setSelectedCharacters] = React.useState<Set<string>>(new Set());
  const { toast } = useToast(); // useToast 사용 복원
  const [toastInfo, setToastInfo] = React.useState<{ title: string, description: string, variant?: 'default' | 'destructive' } | null>(null);

  React.useEffect(() => {
    if (toastInfo) {
      toast(toastInfo);
      setToastInfo(null);
    }
  }, [toastInfo, toast]);

  React.useEffect(() => {
    setRegisteredCharacters(initialCharacters);
  }, [initialCharacters]);

  const handleCharacterRegistered = (characterFromModal: CharacterSearchResult) => {
    // 모달에서 이미 서버 등록 및 중복 체크를 완료했다고 가정합니다.
    // 따라서 여기서는 전달받은 캐릭터를 기존 목록에 추가하기만 합니다.
    // 단, 만약을 위해 클라이언트 측에서 한번 더 중복을 확인할 수는 있습니다.
    setRegisteredCharacters(prev => {
      if (prev.some(c => c.serverId === characterFromModal.serverId && c.characterId === characterFromModal.characterId)) {
        // 이 경우는 모달에서 중복을 걸렀음에도 발생하는 경우이므로, 로직 점검이 필요할 수 있습니다.
        // 일반적으로 모달에서 성공 콜백이 왔다면 중복이 아니어야 합니다.
        // console.warn('Modal에서 등록 성공했으나, MyPageClientContent에서 중복으로 감지됨');
        // setToastInfo({ title: '정보', description: '이미 목록에 있는 캐릭터입니다.', variant: 'default' });
        return prev; 
      }
      // 모달에서 성공 토스트를 이미 띄웠으므로 여기서는 추가 토스트 X
      // 만약 부모에서도 띄우고 싶다면 setToastInfo 사용
      return [...prev, characterFromModal];
    });
    // closeModal은 CharacterRegistrationModal 내부에서 처리합니다.
  }

  const hasAdventurers = registeredCharacters.length > 0
  const adventurerGroupNameDisplay = registeredCharacters.length > 0 
    ? (registeredCharacters[0].adventureName || '정보 없음') 
    : '등록된 모험단 없음'

  const displayName = userNickname || '모험가'; // MyPageHeader에 전달할 최종 사용자 이름

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
    setSelectedCharacters(new Set()); 
  };
  
  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacters(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(characterId)) {
        newSelection.delete(characterId);
      } else {
        newSelection.add(characterId);
      }
      return newSelection;
    });
  };

  const handleDeleteSelected = async () => {
    const accessToken = localStorage.getItem('accessToken'); // localStorage에서 직접 가져오기

    if (selectedCharacters.size === 0) {
      setToastInfo({ title: '알림', description: '삭제할 캐릭터를 선택해주세요.', variant: 'destructive' });
      return;
    }

    const charactersToDelete = Array.from(selectedCharacters);
    let successCount = 0;
    let failCount = 0;

    for (const characterId of charactersToDelete) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/characters?characterId=${characterId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`, // 여기서 업데이트된 accessToken 사용
          },
        });

        if (response.ok) {
          successCount++;
        } else {
          console.error(`Failed to delete character ${characterId}:`, response.status, await response.text());
          failCount++;
        }
      } catch (error) {
        console.error(`Error deleting character ${characterId}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      setToastInfo({ title: '삭제 완료', description: `${successCount}개 캐릭터가 삭제되었습니다.` });
      setRegisteredCharacters(prev => prev.filter(char => !charactersToDelete.includes(char.characterId)));
    }
    if (failCount > 0) {
      setToastInfo({ title: '삭제 실패', description: `${failCount}개 캐릭터 삭제 중 오류가 발생했습니다.`, variant: 'destructive' });
    }
    
    setSelectedCharacters(new Set());
    if (registeredCharacters.length - successCount === 0 && registeredCharacters.length >0) {
        setIsEditMode(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedCharacters.size === registeredCharacters.length && registeredCharacters.length > 0) {
      setSelectedCharacters(new Set());
    } else {
      setSelectedCharacters(new Set(registeredCharacters.map(c => c.characterId)));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl">
      <MyPageHeader 
        userName={displayName} 
        hasAdventurers={hasAdventurers} 
        adventurerGroupName={adventurerGroupNameDisplay} 
        onOpenModalAction={() => setIsModalOpen(true)}
        isEditMode={isEditMode}
        onToggleEditModeAction={toggleEditMode}
      />

      {isEditMode && hasAdventurers && (
        <div className="my-4 p-4 border rounded-md bg-muted/40 flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">
            {selectedCharacters.size} / {registeredCharacters.length} 개 선택됨
          </p>
          <div className="space-x-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              disabled={registeredCharacters.length === 0}
            >
              {selectedCharacters.size === registeredCharacters.length && registeredCharacters.length > 0 ? '전체 해제' : '전체 선택'}
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              disabled={selectedCharacters.size === 0}
              onClick={handleDeleteSelected}
            >
              선택 삭제
            </Button>
          </div>
        </div>
      )}

      {hasAdventurers ? (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">등록된 캐릭터 ({registeredCharacters.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {registeredCharacters.map(char => (
              <div key={`${char.serverId}-${char.characterId}`} className="relative group">
                {isEditMode && (
                  <label 
                    htmlFor={`select-${char.characterId}`} 
                    className="absolute top-0 left-0 w-full h-full bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center cursor-pointer z-10 rounded-md"
                  >
                    <input 
                      type="checkbox"
                      id={`select-${char.characterId}`}
                      className="sr-only"
                      checked={selectedCharacters.has(char.characterId)}
                      onChange={() => handleCharacterSelect(char.characterId)}
                      aria-label={`${char.characterName} 선택`}
                    />
                    {selectedCharacters.has(char.characterId) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 lucide lucide-circle"><circle cx="12" cy="12" r="10"/></svg>
                    )}
                  </label>
                )}
                <CharacterCard 
                  character={char} 
                  serverOptions={serverOptionsData}
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        // 편집 모드가 아닐 때만 NoCharactersMessage 표시 (캐릭터가 없으면 편집할 것도 없으므로)
        !isEditMode && <NoCharactersMessage onOpenModalAction={() => setIsModalOpen(true)} />
      )}

      <CharacterRegistrationModal 
        isOpen={isModalOpen} 
        onCloseAction={() => setIsModalOpen(false)} 
        onCharacterRegisteredAction={handleCharacterRegistered} 
      />
    </div>
  )
}