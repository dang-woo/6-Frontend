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

  return response
}

export default fetchWrapper 