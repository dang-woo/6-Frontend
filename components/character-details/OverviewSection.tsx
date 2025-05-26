'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation' // next/navigation에서 useRouter 임포트
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button' // Button 임포트
import { RefreshCw, PlusCircle, Loader2 } from 'lucide-react' // 아이콘 임포트
import type { DFCharacterResponseDTO } from '@/types/dnf'
import { useAuthStore } from '@/lib/authStore'; // 실제 Zustand 스토어 경로
import fetchWrapper from '@/lib/fetchWrapper'; // fetchWrapper 임포트
import { useToast } from "@/components/ui/use-toast" // Shadcn UI useToast 임포트

interface OverviewSectionProps {
  character: DFCharacterResponseDTO
  serverId: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function OverviewSection ({ character, serverId }: OverviewSectionProps) {
  const router = useRouter()
  const { toast } = useToast() // useToast 사용
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false) // 마이페이지 등록 로딩 상태
  const [displayedLastUpdated, setDisplayedLastUpdated] = useState<string | null>(null);

  const { isLoggedIn } = useAuthStore(); // accessToken 제거 (사용하지 않음)

  // character prop이 변경될 때마다 displayedLastUpdated를 업데이트합니다.
  useEffect(() => {
    if (character.lastUpdated) {
      const newLastUpdatedString = Array.isArray(character.lastUpdated)
        ? new Date(character.lastUpdated[0], character.lastUpdated[1] - 1, character.lastUpdated[2], character.lastUpdated[3], character.lastUpdated[4], character.lastUpdated[5]).toLocaleString()
        : new Date(String(character.lastUpdated)).toLocaleString();
      setDisplayedLastUpdated(newLastUpdatedString);
    } else {
      setDisplayedLastUpdated('정보 없음');
    }
  }, [character.lastUpdated]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return; // 이미 갱신 중이면 중복 실행 방지

    setIsRefreshing(true);
    setCountdown(10); 
    setDisplayedLastUpdated(new Date().toLocaleString()); // 즉시 현재 시간으로 업데이트

    router.refresh(); // 서버 데이터 재요청

    // 카운트다운 타이머 설정
    let currentCountdown = 10;
    const timer = setInterval(() => {
      currentCountdown -= 1;
      setCountdown(currentCountdown);
      if (currentCountdown === 0) {
        clearInterval(timer);
        setIsRefreshing(false); 
        // 새로운 character prop이 전달되면 위의 useEffect에 의해 displayedLastUpdated가 자동으로 다시 계산됩니다.
      }
    }, 1000);

  }, [router, isRefreshing]); // countdown 의존성 제거

  const handleAddToMyPage = async () => {
    if (!isLoggedIn || !character?.characterId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetchWrapper(`${API_BASE_URL}/api/my-page/characters`, {
        method: 'POST',
        body: JSON.stringify({ 
          serverId,
          characterId: character.characterId,
          characterName: character.characterName,
          jobGrowName: character.jobGrowName,
          level: character.level,
          fame: character.fame,
          characterImageUrl: character.imageUrl // 대표 이미지 URL도 함께 저장 (백엔드 스키마에 따라 조절)
        }),
      });

      if (response.ok) {
        // const responseData = await response.json(); // 성공 시 응답 본문이 있다면 처리
        toast({ title: '등록 성공', description: '마이페이지에 캐릭터를 등록했습니다.' });
        // TODO: 등록 성공 후 버튼 상태 변경 (예: "등록됨" 또는 버튼 숨김, 상태 관리 필요)
      } else {
        let errorMessage = '캐릭터 등록에 실패했습니다.';
        let errorCode = null;
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText); // 에러 응답이 JSON 형식이라고 가정
            errorMessage = errorData.message || errorMessage;
            errorCode = errorData.errorCode || null;
          } else if (response.status === 409) { // 이미 등록된 경우 (Conflict)
            errorMessage = '이미 마이페이지에 등록된 캐릭터입니다.';
            errorCode = 'ALREADY_REGISTERED'; 
          } else if (response.status === 400) { // 잘못된 요청 (예: 모험단 불일치)
             // errorCode를 백엔드에서 보내준다면 그것을 활용
            errorMessage = '입력 정보를 확인해주세요. (예: 모험단 불일치)';
            errorCode = 'INVALID_INPUT'; 
          }
        } catch (e) {
          // JSON 파싱 실패 시 또는 errorText가 없을 때
          console.warn('Could not parse error response as JSON or response was empty');
        }

        if (errorCode === 'ALREADY_REGISTERED') {
          toast({ title: '등록 실패', description: '이미 마이페이지에 등록된 캐릭터입니다.', variant: 'destructive' });
        } else if (errorCode === 'ADVENTURE_NAME_MISMATCH') { // 백엔드에서 이런 errorCode를 준다고 가정
          toast({ title: '등록 실패', description: '등록된 계정의 모험단과 일치하지 않습니다.', variant: 'destructive' });
        } else {
          toast({ title: '등록 실패', description: errorMessage, variant: 'destructive' });
        }
        console.error('마이페이지 캐릭터 등록 실패:', { status: response.status, message: errorMessage, code: errorCode });
      }
    } catch (error) {
      console.error('마이페이지 캐릭터 등록 중 예외 발생:', error);
      toast({ title: '오류 발생', description: '캐릭터 등록 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden mb-6 shadow-lg">
      <CardHeader className="bg-muted/30 p-4 sm:p-6 relative">
        {isLoggedIn && (
          <Button
            onClick={handleAddToMyPage}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 z-10 md:hidden flex-shrink-0 min-w-[150px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />등록 중...</>
            ) : (
              <><PlusCircle className="w-4 h-4 mr-2" />마이페이지에 등록</>
            )}
          </Button>
        )}

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
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">{character.characterName}</h1>
                <p className="text-lg sm:text-xl text-muted-foreground mt-1">
                  Lv.{character.level} {character.jobGrowName} <span className="text-sm sm:text-base">({character.jobName})</span>
                </p>
              </div>
              {isLoggedIn && (
                <Button
                  onClick={handleAddToMyPage}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex flex-shrink-0 ml-auto min-w-[150px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />등록 중...</>
                  ) : (
                    <><PlusCircle className="w-4 h-4 mr-2" />마이페이지에 등록</>
                  )}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs sm:text-sm">서버: {serverId}</Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">모험단: {character.adventureName || '-'}</Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">길드: {character.guildName || '-'}</Badge>
            </div>
            <p className="text-xl sm:text-2xl font-semibold">명성: <span className="text-amber-500">{character.fame || '정보 없음'}</span></p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground/80">추가 정보</h2>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs sm:text-sm min-w-[120px]"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshing && countdown > 0 ? 'animate-spin' : ''}`} />
            {isRefreshing && countdown > 0 ? `갱신 중 (${countdown}초)` : (isRefreshing ? '처리 중...' : '갱신')}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
          <p><strong className="font-medium text-muted-foreground">최근 업데이트:</strong> {displayedLastUpdated || '정보 로딩 중...'}</p>
        </div>
      </CardContent>
    </Card>
  )
} 