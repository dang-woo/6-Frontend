import * as React from 'react'
import { cookies } from 'next/headers' // 서버에서 쿠키를 읽기 위해 import
import Link from 'next/link' // Next.js 13+ 에서는 Link 사용 권장
import { Button } from '@/components/ui/button'
import type { CharacterSearchResult, CharacterRegist, DFCharacterResponseDTO } from '@/types/dnf' // CharacterRegist는 이제 사용 안함
import { MyPageClientContent } from '@/components/my-page/MyPageClientContent'
import { LoginRequiredMessage } from '@/components/my-page/LoginRequiredMessage'
import { getServerUserProfile } from '@/lib/services/authService'
import { getMyPageCharacters } from '@/lib/services/characterService'

// API_BASE_URL은 이제 각 서비스 함수 내부에서 .env를 통해 직접 참조합니다.
// const API_BASE_URL = .env.NEXT_PUBLIC_API_process.envURL;

export default async function MyPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value
  // console.log('[MyPage RSC] Token from cookie:', token ? 'Exists' : 'Not Found'); // 개발 시에만 사용

  if (!token) {
    // console.log('[MyPage RSC] No token found, rendering LoginRequiredMessage.'); // 개발 시에만 사용
    return <LoginRequiredMessage />;
  }

  let userNickname: string | null = null;
  let initialCharacters: CharacterSearchResult[] = [];
  let isLoggedInServer = true; // 토큰이 존재하므로 일단 true로 가정

  try {
    // 1. 사용자 프로필(닉네임) 조회
    userNickname = await getServerUserProfile(token);
    // if (userNickname === null) {
    //   console.warn('[MyPage RSC] Failed to fetch user nickname, but proceeding to fetch characters.');
    // }
    // console.log('[MyPage RSC] User nickname:', userNickname); // 개발 시에만 사용

    // 2. 등록된 캐릭터 목록 및 상세 정보 조회
    initialCharacters = await getMyPageCharacters(token);
    // console.log('[MyPage RSC] Fetched characters count:', initialCharacters.length); // 개발 시에만 사용

  } catch (error: any) {
    console.error('[MyPage RSC] Error during data fetching:', error.message); // 에러 메시지만 간략히 로깅
    if (error.message === 'AuthenticationError') {
      // console.warn('[MyPage RSC] AuthenticationError caught, rendering LoginRequiredMessage.'); // 개발 시에만 사용
      isLoggedInServer = false; // getMyPageCharacters에서 인증 오류 발생 시
    } else {
      // 프로덕션에서는 ErrorAlert 등을 사용하여 사용자에게 안내하는 것을 고려
    }
  }

  if (!isLoggedInServer) {
    // getMyPageCharacters 내부에서 인증 오류가 발생하여 isLoggedInServer가 false가 된 경우
    return <LoginRequiredMessage />;
  }
  
  // 최종적으로 렌더링할 데이터 로깅
  // console.log('[MyPage RSC] Final data for MyPageClientContent:');
  // console.log('  isLoggedInServer:', isLoggedInServer); // 이 시점에는 항상 true여야 함 (false면 위에서 반환됨)
  // console.log('  userNickname:', userNickname);
  // console.log('  initialCharacters count:', initialCharacters.length);

  return (
    <MyPageClientContent 
      initialCharacters={initialCharacters} 
      userNickname={userNickname} // 서버에서 가져온 닉네임 전달
    />
  );
}
