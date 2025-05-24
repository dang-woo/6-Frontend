import * as React from 'react'
import { cookies } from 'next/headers' // 서버에서 쿠키를 읽기 위해 import
import Link from 'next/link' // Next.js 13+ 에서는 Link 사용 권장
import { Button } from '@/components/ui/button'
import type { CharacterSearchResult, CharacterRegist, DFCharacterResponseDTO } from '@/types/dnf' // CharacterRegist는 이제 사용 안함
import { MyPageClientContent } from '@/components/my-page/MyPageClientContent'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL


export default async function MyPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value
  console.log('[MyPage RSC] accessToken from cookie:', token);

  let initialCharacters: CharacterSearchResult[] = []
  let userNickname: string | null = null; // 사용자 닉네임 저장 변수
  let isLoggedInServer = !!token;
  console.log('[MyPage RSC] Initial isLoggedInServer (based on token presence):', isLoggedInServer);

  if (token) {
    // 사용자 닉네임 조회 로직 추가
    try {
      console.log('[MyPage RSC] Attempting to fetch user profile from /api/auth/me');
      const userProfileResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store', 
      });
      if (userProfileResponse.ok) {
        const profileData = await userProfileResponse.json();
        if (profileData && profileData.success && profileData.user && profileData.user.nickname) {
          userNickname = profileData.user.nickname;
        } else if (profileData && profileData.nickname) { 
          userNickname = profileData.nickname;
        }
        console.log('[MyPage RSC] User nickname fetched:', userNickname);
      } else {
        console.warn('[MyPage RSC] Failed to fetch user profile, status:', userProfileResponse.status);
        // if (userProfileResponse.status === 401 || userProfileResponse.status === 403) isLoggedInServer = false;
      }
    } catch (error) {
      console.error('[MyPage RSC] Error fetching user profile:', error);
    }

    // 기존 캐릭터 목록 조회 로직
    try {
      console.log('[MyPage RSC] 1. Attempting to fetch base registered characters from /api/characters/adventure');
      const baseCharactersResponse = await fetch(`${API_BASE_URL}/api/characters/adventure`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      });

      console.log('[MyPage RSC] /api/characters/adventure response status:', baseCharactersResponse.status);
      const baseCharactersBodyText = await baseCharactersResponse.text();
      // console.log('[MyPage RSC] /api/characters/adventure response body:', baseCharactersBodyText); // 너무 길면 주석 처리

      if (baseCharactersResponse.ok) {
        const baseData = JSON.parse(baseCharactersBodyText);
        let registeredBaseCharacters: CharacterRegist[] = [];

        // /api/characters/adventure 응답 형식에 따라 파싱
        if (Array.isArray(baseData)) {
          registeredBaseCharacters = baseData;
        } else if (baseData && typeof baseData === 'object' && baseData.success === true && Array.isArray(baseData.charactersByUserId)) {
          registeredBaseCharacters = baseData.charactersByUserId;
        } else if (baseData && typeof baseData === 'object' && baseData.success === true && Array.isArray(baseData.data)) { // 다른 가능한 래핑 형식
          registeredBaseCharacters = baseData.data;
        } else if (baseData && typeof baseData === 'object' && baseData.success === true && baseData.message === "등록된 캐릭터가 없습니다.") {
          console.log('[MyPage RSC] No characters registered for the user (from /api/characters/adventure).');
          registeredBaseCharacters = [];
        } else {
          console.warn('[MyPage RSC] Unexpected response structure from /api/characters/adventure. Assuming no characters. Body:', baseCharactersBodyText);
          registeredBaseCharacters = []; // 알 수 없는 구조면 빈 배열 처리
        }
        
        if (registeredBaseCharacters.length > 0) {
          console.log(`[MyPage RSC] 2. Found ${registeredBaseCharacters.length} base characters. Fetching details...`);
          
          const characterDetailPromises = registeredBaseCharacters.map(async (regist) => {
            // CharacterRegist 타입에 필요한 필드가 모두 있는지 확인 (특히 serverId, characterId)
            if (!regist.serverId || !regist.characterId) {
              console.warn('[MyPage RSC]   Skipping character due to missing serverId or characterId in base data:', regist);
              return null; // 필수 정보 없으면 스킵
            }
            try {
              console.log(`[MyPage RSC]   Fetching detail for ${regist.characterName} (${regist.serverId}/${regist.characterId}) from /api/df/character`);
              const detailResponse = await fetch(`${API_BASE_URL}/api/df/character?server=${regist.serverId}&characterId=${regist.characterId}`, {
                cache: 'no-store',
              });

              if (detailResponse.ok) {
                const detail: DFCharacterResponseDTO = await detailResponse.json();
                return {
                  serverId: detail.serverId || regist.serverId,
                  characterId: detail.characterId || regist.characterId,
                  characterName: detail.characterName || regist.characterName,
                  level: detail.level || 0,
                  jobId: detail.jobId || '', 
                  jobGrowId: detail.jobGrowId || '',
                  jobName: detail.jobName || (regist as any).jobName || '', // regist에 jobName이 있을 수도 있음
                  jobGrowName: detail.jobGrowName || (regist as any).jobGrowName || '정보 없음',
                  fame: detail.fame ? parseInt(detail.fame) : 0, 
                  imageUrl: detail.imageUrl || '/images/placeholder.png',
                  adventureName: detail.adventureName || regist.adventureName,
                } as CharacterSearchResult;
              } else {
                console.warn(`[MyPage RSC]   Failed to fetch detail for ${regist.characterName}. Status: ${detailResponse.status}. Using base info.`);
                return {
                  serverId: regist.serverId,
                  characterId: regist.characterId,
                  characterName: regist.characterName,
                  level: (regist as any).level || 0, // regist에 level이 있을 수도 있음
                  jobId: '',
                  jobGrowId: '',
                  jobName: (regist as any).jobName || '',
                  jobGrowName: (regist as any).jobGrowName || '정보 없음',
                  fame: (regist as any).fame || 0,
                  imageUrl: (regist as any).imageUrl || '/images/placeholder.png',
                  adventureName: regist.adventureName,
                } as CharacterSearchResult;
              }
            } catch (charError) {
              console.error(`[MyPage RSC]   Error fetching or processing detail for ${regist.characterName}:`, charError);
              return {
                serverId: regist.serverId,
                characterId: regist.characterId,
                characterName: regist.characterName,
                level: (regist as any).level || 0,
                jobId: '',
                jobGrowId: '',
                jobName: (regist as any).jobName || '',
                jobGrowName: (regist as any).jobGrowName || '정보 없음',
                fame: (regist as any).fame || 0,
                imageUrl: (regist as any).imageUrl || '/images/placeholder.png',
                adventureName: regist.adventureName,
              } as CharacterSearchResult;
            }
          });

          // Promise.allSettled를 사용하여 일부 프로미스가 실패하더라도 나머지를 처리
          const results = await Promise.allSettled(characterDetailPromises);
          initialCharacters = results
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => (result as PromiseFulfilledResult<CharacterSearchResult>).value);
            
          console.log('[MyPage RSC] 3. Successfully processed character details. Final count:', initialCharacters.length);

        } else {
          console.log('[MyPage RSC] No base characters found, initialCharacters remains empty.');
        }

      } else if (baseCharactersResponse.status === 401 || baseCharactersResponse.status === 403) {
        console.warn('[MyPage RSC] Authentication error (401/403) from /api/characters/adventure. Setting isLoggedInServer to false.');
        isLoggedInServer = false;
      } else {
        console.error('[MyPage RSC] API call to /api/characters/adventure failed with status:', baseCharactersResponse.status, 'Body:', baseCharactersBodyText);
      }
    } catch (error) {
      console.error('[MyPage RSC] Error in main try-catch block while fetching characters:', error);
    }
  }

  console.log('[MyPage RSC] Final isLoggedInServer value before rendering:', isLoggedInServer);
  console.log('[MyPage RSC] Final userNickname value before rendering:', userNickname);
  console.log('[MyPage RSC] Final initialCharacters count before rendering:', initialCharacters.length);

  if (!isLoggedInServer) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">로그인이 필요한 서비스입니다.</h2>
          <p className="mb-8 text-muted-foreground">마이페이지를 이용하시려면 먼저 로그인해주세요.</p>
          <Button asChild>
            <Link href="/login">로그인 하러가기</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <MyPageClientContent 
      initialCharacters={initialCharacters} 
      userNickname={userNickname}
    />
  );
}
