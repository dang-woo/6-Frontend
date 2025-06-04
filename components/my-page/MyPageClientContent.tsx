'use client'

import * as React from 'react'
// import { useRouter } from 'next/navigation' // 현재 미사용
import { MyPageHeader } from '@/components/my-page/MyPageHeader'
import { NoCharactersMessage } from '@/components/my-page/NoCharactersMessage'
import { CharacterRegistrationModal } from '@/components/my-page/CharacterRegistrationModal'
import { AccountDeletionModal } from '@/components/my-page/AccountDeletionModal'
import type { CharacterSearchResult, ServerOption } from '@/types/dnf'
import { CharacterCard } from '@/components/search/CharacterCard'
import { Button } from '@/components/ui/button' // 삭제 UI에 사용될 수 있으므로 import 유지
import { useToast } from '@/components/ui/use-toast' // Shadcn UI useToast 임포트
import { useAuthStore } from '@/lib/authStore' // 경로 수정
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // Select 컴포넌트 임포트 추가
import { CharacterComparisonResult } from './CharacterComparisonResult'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

// 서버 ID로 서버 이름을 찾는 헬퍼 함수 추가
const getServerNameById = (serverId: string): string => {
  const server = serverOptionsData.find(option => option.value === serverId);
  return server ? server.label : serverId; // 서버 이름을 찾지 못하면 serverId 반환
};

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

  // 회원 탈퇴 관련 상태 추가
  const [isAccountDeleteModalOpen, setIsAccountDeleteModalOpen] = React.useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const { clearAuth } = useAuthStore(); // Zustand 스토어에서 clearAuth 가져오기

  // 캐릭터 비교 관련 상태 추가
  const [charCompare1, setCharCompare1] = React.useState<CharacterSearchResult | null>(null);
  const [charCompare2, setCharCompare2] = React.useState<CharacterSearchResult | null>(null);
  const [comparisonResult, setComparisonResult] = React.useState<any[] | null>(null); // API 응답 타입에 맞게 수정 필요
  const [isComparing, setIsComparing] = React.useState(false);
  const [comparisonError, setComparisonError] = React.useState<string | null>(null);

  // 캐릭터 검색을 위한 상태 추가
  const [searchServer, setSearchServer] = React.useState<string>('');
  const [searchCharacterName, setSearchCharacterName] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchedCharacter, setSearchedCharacter] = React.useState<CharacterSearchResult | null>(null);

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

  // 회원 탈퇴 처리 함수
  const handleConfirmAccountDeletion = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, { // 원래 엔드포인트로 복구
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        setToastInfo({ title: '회원 탈퇴 성공', description: '계정이 성공적으로 삭제되었습니다. 이용해주셔서 감사합니다.' });
        clearAuth();
      } else {
        const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
        setToastInfo({ title: '회원 탈퇴 실패', description: errorData.message || '계정 삭제 중 오류가 발생했습니다.', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setToastInfo({ title: '회원 탈퇴 오류', description: '네트워크 오류 또는 서버 문제로 계정 삭제에 실패했습니다.', variant: 'destructive' });
    } finally {
      setIsDeletingAccount(false);
      setIsAccountDeleteModalOpen(false);
    }
  };

  // 캐릭터 검색 함수
  const handleSearchCharacter = async () => {
    if (!searchServer || !searchCharacterName.trim()) {
      setToastInfo({ 
        title: '검색 오류', 
        description: '서버와 캐릭터 이름을 모두 입력해주세요.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/df/character/search?server=${searchServer}&characterName=${encodeURIComponent(searchCharacterName)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setSearchedCharacter(data[0]);
          setCharCompare2(data[0]);
        } else {
          setToastInfo({ 
            title: '검색 결과 없음', 
            description: '해당하는 캐릭터를 찾을 수 없습니다.', 
            variant: 'destructive' 
          });
          setSearchedCharacter(null);
          setCharCompare2(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: '캐릭터 검색에 실패했습니다.' }));
        setToastInfo({ 
          title: '검색 실패', 
          description: errorData.message || '캐릭터 검색 중 오류가 발생했습니다.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error("Character search error:", error);
      setToastInfo({ 
        title: '검색 오류', 
        description: '네트워크 오류 또는 서버 문제로 검색에 실패했습니다.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSearching(false);
    }
  };

  // 캐릭터 비교 섹션 수정
  const renderComparisonSection = () => {
    if (!hasAdventurers || registeredCharacters.length < 1) return null;

    return (
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-xl font-semibold mb-4">캐릭터 비교</h3>
        <div className="space-y-4">
          {/* 내 캐릭터 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">내 캐릭터 선택</label>
            <Select 
              onValueChange={(value) => {
                const selected = registeredCharacters.find(c => c.characterId === value.split('_')[1] && c.serverId === value.split('_')[0]);
                setCharCompare1(selected || null);
              }}
              value={charCompare1 ? `${charCompare1.serverId}_${charCompare1.characterId}` : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="비교할 캐릭터 선택" />
              </SelectTrigger>
              <SelectContent>
                {registeredCharacters.map(char => (
                  <SelectItem key={`${char.serverId}_${char.characterId}`} value={`${char.serverId}_${char.characterId}`}>
                    {char.characterName} ({getServerNameById(char.serverId)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 다른 캐릭터 검색 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">다른 캐릭터 검색</label>
            <div className="flex gap-2">
              <Select value={searchServer} onValueChange={setSearchServer}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="서버 선택" />
                </SelectTrigger>
                <SelectContent>
                  {serverOptionsData.filter(s => s.value !== 'all' && s.value !== 'adventure').map(server => (
                    <SelectItem key={server.value} value={server.value}>
                      {server.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="캐릭터명 입력"
                value={searchCharacterName}
                onChange={(e) => setSearchCharacterName(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSearchCharacter} 
                disabled={isSearching || !searchServer || !searchCharacterName.trim()}
              >
                {isSearching ? '검색 중...' : '검색'}
              </Button>
            </div>
          </div>

          {/* 비교 버튼 */}
          <div className="flex justify-end mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      // onClick={handleCompareCharacters} 
                      disabled={true}
                      className="w-full md:w-auto"
                    >
                      준비중입니다
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>캐릭터 비교 기능은 현재 개발중입니다.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 검색 결과 표시 */}
          {searchedCharacter && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">검색된 캐릭터</h4>
              <div className="w-full max-w-xs">
                <CharacterCard 
                  character={searchedCharacter}
                  serverOptions={serverOptionsData}
                />
              </div>
            </div>
          )}

          {/* 비교 결과 */}
          {isComparing && <p className="text-center py-4">캐릭터 정보를 비교 중입니다...</p>}
          {comparisonError && <p className="text-red-500 text-center py-4">{comparisonError}</p>}
          {comparisonResult && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">비교 결과</h4>
              <CharacterComparisonResult 
                comparisonData={comparisonResult} 
                serverOptions={serverOptionsData}
              />
            </div>
          )}
        </div>
      </div>
    );
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

      {renderComparisonSection()}

      {/* 회원 탈퇴 섹션 추가 */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-xl font-semibold mb-3">계정 관리</h3>
        <Button 
          variant="destructive"
          onClick={() => setIsAccountDeleteModalOpen(true)}
          disabled={isDeletingAccount}
        >
          {isDeletingAccount ? "처리 중..." : "회원 탈퇴"}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
        </p>
      </div>

      <CharacterRegistrationModal 
        isOpen={isModalOpen} 
        onCloseAction={() => setIsModalOpen(false)} 
        onCharacterRegisteredAction={handleCharacterRegistered} 
      />

      {/* 회원 탈퇴 확인 모달 렌더링 */}
      <AccountDeletionModal
        isOpen={isAccountDeleteModalOpen}
        onClose={() => setIsAccountDeleteModalOpen(false)}
        onConfirm={handleConfirmAccountDeletion}
        isLoading={isDeletingAccount}
      />
    </div>
  )
}