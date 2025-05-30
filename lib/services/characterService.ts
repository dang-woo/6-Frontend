import { DFCharacterResponseDTO, CharacterRegist, CharacterSearchResult } from '@/types/dnf';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('[characterService] API_BASE_URL:', API_BASE_URL); // 환경 변수 값 확인

export async function getCharacterDetails(serverId: string, characterId: string): Promise<DFCharacterResponseDTO | null> {
  if (!API_BASE_URL) {
    console.error('[characterService] CRITICAL: API_BASE_URL is not configured for getCharacterDetails');
    return null;
  }
  try {
    if (!characterId || characterId.trim() === '') {
      // console.error('[characterService] Character ID is missing or empty for getCharacterDetails.'); // 호출부에서 처리 가능
      return null;
    }
    const res = await fetch(`${API_BASE_URL}/api/df/character?server=${serverId}&characterId=${characterId}`);
    if (!res.ok) {
      // console.error(`[characterService] Failed to fetch character details for ${characterId}: ${res.status} ${res.statusText}`);
      // 상태 코드에 따라 다른 로깅 레벨 사용 가능
      if (res.status === 404) {
        console.warn(`[characterService] Character not found (404) for ID: ${characterId} on server: ${serverId}`);
      } else {
        console.error(`[characterService] Failed to fetch character details for ${characterId} on server ${serverId}. Status: ${res.status}`);
      }
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`[characterService] Network or other error fetching details for ${characterId} on server ${serverId}:`, error); // 오류 객체 전체 로깅
    return null;
  }
}

/**
 * 마이페이지에 표시될 사용자의 캐릭터 목록과 각 캐릭터의 상세 정보를 가져옵니다.
 * @param token - 사용자 인증 토큰
 * @returns 처리된 캐릭터 정보 배열 (CharacterSearchResult[])
 */
export async function getMyPageCharacters(token: string): Promise<CharacterSearchResult[]> {
  if (!API_BASE_URL) {
    console.error('[characterService] CRITICAL: API_BASE_URL is not configured for getMyPageCharacters');
    return [];
  }
  if (!token) {
    // console.warn('[characterService] No token provided for fetching my page characters.'); // MyPage에서 이미 처리
    return [];
  }

  // let initialCharacters: CharacterSearchResult[] = []; // 함수 스코프 내에서만 사용되므로, 반환 직전에 선언 가능

  try {
    // console.log('[characterService] 1. Fetching base registered characters from /api/characters/adventure');
    const baseCharactersResponse = await fetch(`${API_BASE_URL}/api/characters/adventure`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });

    // console.log('[characterService] /api/characters/adventure response status:', baseCharactersResponse.status);

    if (!baseCharactersResponse.ok) {
      if (baseCharactersResponse.status === 401 || baseCharactersResponse.status === 403) {
        console.warn('[characterService] AuthenticationError fetching base characters. Throwing error.');
        throw new Error('AuthenticationError'); 
      }
      console.error('[characterService] API call to /api/characters/adventure failed. Status:', baseCharactersResponse.status);
      return []; 
    }
    
    const baseData = await baseCharactersResponse.json(); 
    let registeredBaseCharacters: CharacterRegist[] = [];

    if (Array.isArray(baseData)) {
      registeredBaseCharacters = baseData;
    } else if (baseData && typeof baseData === 'object' && baseData.success === true && Array.isArray(baseData.charactersByUserId)) {
      registeredBaseCharacters = baseData.charactersByUserId;
    } else if (baseData && typeof baseData === 'object' && baseData.success === true && Array.isArray(baseData.data)) {
      registeredBaseCharacters = baseData.data;
    } else if (baseData && typeof baseData === 'object' && baseData.success === true && baseData.message === "등록된 캐릭터가 없습니다.") {
      // console.log('[characterService] No characters registered for the user (from /api/characters/adventure).');
      return []; 
    } else {
      console.warn('[characterService] Unexpected response structure from /api/characters/adventure. Assuming no characters.');
      return [];
    }
    
    if (registeredBaseCharacters.length === 0) {
      // console.log('[characterService] No base characters found after parsing, returning empty array.');
      return [];
    }

    // console.log(`[characterService] 2. Found ${registeredBaseCharacters.length} base characters. Fetching details...`);
    
    const characterDetailPromises = registeredBaseCharacters.map(async (regist) => {
      if (!regist.serverId || !regist.characterId) {
        // console.warn('[characterService]   Skipping character due to missing serverId or characterId in base data:', regist);
        return null;
      }
      try {
        const detail = await getCharacterDetails(regist.serverId, regist.characterId);
        if (detail) {
          return {
            serverId: detail.serverId || regist.serverId,
            characterId: detail.characterId || regist.characterId,
            characterName: detail.characterName || regist.characterName,
            level: detail.level || 0,
            jobId: detail.jobId || '', 
            jobGrowId: detail.jobGrowId || '',
            jobName: detail.jobName || (regist as any).jobName || '',
            jobGrowName: detail.jobGrowName || (regist as any).jobGrowName || '정보 없음',
            fame: detail.fame ? parseInt(String(detail.fame)) : 0, 
            imageUrl: detail.imageUrl || '/images/placeholder.png',
            adventureName: detail.adventureName || regist.adventureName,
          } as CharacterSearchResult;
        } else {
          // console.warn(`[characterService]   Failed to fetch detail for ${regist.characterName}. Using base info.`);
          // 상세 정보 조회 실패 시, 기본 정보라도 반환하기 위해 CharacterSearchResult 형태로 반환
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
      } catch (charError) {
        console.error(`[characterService]   Error during getCharacterDetails for ${regist.characterName} (${regist.characterId}):`, charError);
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

    const results = await Promise.allSettled(characterDetailPromises);
    const initialCharacters: CharacterSearchResult[] = results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<CharacterSearchResult>).value);
      
    // console.log('[characterService] 3. Successfully processed character details. Final count:', initialCharacters.length);
    return initialCharacters;

  } catch (error: any) {
    if (error.message === 'AuthenticationError') {
      throw error; 
    }
    console.error('[characterService] Error in main try-catch block for getMyPageCharacters:', error); // 오류 객체 전체 로깅
    return []; 
  }
} 