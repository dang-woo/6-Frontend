'use client'

import { useAuthStore } from './authStore'

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

async function fetchWrapper (url: string, options?: FetchOptions): Promise<Response> {
  const { accessToken } = useAuthStore.getState()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers ?? {})
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (response.status === 401) {
    // 토큰 만료 또는 인증 실패 시 로그아웃 처리
    useAuthStore.getState().clearAuth();
    // 에러를 다시 던지거나, 특정 에러 객체를 반환하여 호출 측에서 추가 처리할 수 있도록 함
    // 여기서는 에러를 그대로 반환하여 호출 측에서 catch 할 수 있도록 합니다.
    // throw new Error('Unauthorized: Token may be expired'); 
  }

  return response
}

export default fetchWrapper 