const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('[authService] API_BASE_URL:', API_BASE_URL); // 환경 변수 값 확인

// interface UserProfile { ... } // 이 인터페이스는 현재 사용되지 않으므로 제거 또는 주석 처리 가능

/**
 * 서버 사이드에서 사용자 프로필 정보를 가져옵니다.
 * @param token - 사용자 인증 토큰
 * @returns 사용자 닉네임 또는 null
 */
export async function getServerUserProfile(token: string): Promise<string | null> {
  if (!API_BASE_URL) {
    console.error('[authService] CRITICAL: API_BASE_URL is not configured'); // 중요한 설정 누락은 유지
    return null;
  }
  if (!token) {
    // console.warn('[authService] No token provided for fetching user profile.'); // 호출부에서 이미 처리 가능
    return null;
  }

  try {
    // console.log('[authService] Attempting to fetch user profile from /api/auth/me'); // 개발 시에만 사용
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store', // 마이페이지 정보는 최신 상태를 유지하는 것이 좋으므로 캐시 사용 안 함
    });

    if (response.ok) {
      const profileData = await response.json();
      if (profileData && profileData.success && profileData.user && profileData.user.nickname) {
        return profileData.user.nickname;
      } else if (profileData && profileData.nickname) { 
        return profileData.nickname;
      }
      // console.warn('[authService] User nickname not found in profile data:', profileData); // profileData 전체 로깅은 민감할 수 있음
      console.warn('[authService] User nickname not found in expected profile data structure.');
      return null;
    } else {
      // console.warn('[authService] Failed to fetch user profile, status:', response.status); // status는 유용할 수 있음
      // 접근 권한 없음(401, 403)과 그 외 서버 오류를 구분해서 로깅하거나 처리 가능
      if (response.status === 401 || response.status === 403) {
        console.warn(`[authService] Authentication/Authorization error (${response.status}) fetching user profile.`);
      } else {
        console.error(`[authService] Server error (${response.status}) fetching user profile.`);
      }
      return null;
    }
  } catch (error) {
    console.error('[authService] Network or other error fetching user profile:', error); // 오류 객체 전체 로깅
    return null;
  }
} 