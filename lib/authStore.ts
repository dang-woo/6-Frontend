import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  userId: string
  nickname: string
  // 필요에 따라 다른 사용자 정보 추가
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isLoggedIn: boolean // isAuthenticated 대신 isLoggedIn 사용
  isLoading: boolean // 로딩 상태 추가
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  initializeAuth: () => void
  setIsLoading: (isLoading: boolean) => void // setIsLoading 액션 추가
}

// localStorage 사용 가능 여부 확인 함수
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__zustand_test_ls__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoggedIn: false, // 초기값 false
      isLoading: true, // 앱 시작 시 로딩 상태 true
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isLoggedIn: !!accessToken, isLoading: false }) // 토큰 설정 시 isLoading false
        if (isLocalStorageAvailable()) {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
        }
      },
      setUser: (user) => {
        set({ user, isLoading: false }) // 유저 정보 설정 시 isLoading false
        if (isLocalStorageAvailable()) {
          localStorage.setItem('user', JSON.stringify(user))
        }
      },
      clearAuth: () => {
        set({ accessToken: null, refreshToken: null, user: null, isLoggedIn: false, isLoading: false }) // 로그아웃 시 isLoading false
        if (isLocalStorageAvailable()) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      },
      initializeAuth: () => {
        set({ isLoading: true }) // 초기화 시작 시 로딩 true
        if (isLocalStorageAvailable()) {
          const accessToken = localStorage.getItem('accessToken')
          const refreshToken = localStorage.getItem('refreshToken')
          const userString = localStorage.getItem('user')
          let user = null
          if (userString) {
            try {
              user = JSON.parse(userString)
            } catch (e) {
              console.error('Failed to parse user from localStorage', e)
              localStorage.removeItem('user')
            }
          }
          if (accessToken && refreshToken) {
            set({ accessToken, refreshToken, user, isLoggedIn: true, isLoading: false })
          } else {
            set({ isLoading: false }) // 토큰 없으면 로딩 완료
          }
        } else {
          set({ isLoading: false }) // localStorage 사용 불가 시 로딩 완료
        }
      },
      setIsLoading: (isLoading: boolean) => set({ isLoading }), // setIsLoading 구현
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // onRehydrateStorage는 persist v4부터 deprecated 되었습니다.
      // 대신 hydration이 완료된 후 특정 로직을 실행하려면 아래와 같이 처리할 수 있습니다.
      // (하지만 이 예제에서는 initializeAuth를 앱 시작 시 수동 호출하므로 필요하지 않을 수 있습니다.)
      // onRehydrateStorage: () => {
      //   return (state, error) => {
      //     if (error) {
      //       console.error('An error occurred during hydration', error)
      //     } else {
      //       // Hydration이 완료된 후 실행할 로직 (예: state.initializeAuth())
      //       // 하지만 이미 앱 최상단에서 initializeAuth를 호출하고 있으므로 중복될 수 있음
      //     }
      //   }
      // }
      // version: 1, // 상태 버전 관리 (마이그레이션 필요 시)
      // migrate: (persistedState, version) => {
      //   if (version === 0) {
      //     // 예시: 만약 이전 버전(0)에서 isLoading 상태가 없었다면 추가
      //     // (persistedState as any).isLoading = false 
      //   }
      //   return persistedState as AuthState
      // },
    }
  )
)

// 앱 초기화 시 (클라이언트 사이드에서) 인증 상태 로드
// typeof window !== 'undefined' 조건은 persist 미들웨어 내부에서도 처리될 수 있으나,
// 명시적으로 클라이언트 환경에서만 호출하도록 보장합니다.
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth()
} 