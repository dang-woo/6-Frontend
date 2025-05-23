'use client' // 클라이언트 측 훅이므로 명시

import * as React from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    // 초기 렌더링 시 window 객체가 없을 수 있으므로 (SSR 등) 확인
    if (typeof window === 'undefined') {
      return
    }

    const mediaQueryList = window.matchMedia(query)
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // 초기 상태 설정
    setMatches(mediaQueryList.matches)

    // Safari < 14 에서는 addEventListener/removeEventListener 대신 addListener/removeListener 사용
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener)
      return () => {
        mediaQueryList.removeEventListener('change', listener)
      }
    } else {
      // Deprecated but necessary obstáculos Safari < 14
      mediaQueryList.addListener(listener) // TODO: check Safari version and use addListener only if needed
      return () => {
        mediaQueryList.removeListener(listener)
      }
    }
  }, [query])

  return matches
} 