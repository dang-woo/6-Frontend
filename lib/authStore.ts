import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { useToast } from '@/hooks/use-toast'

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
      isLoggedIn: false,
      isLoading: true,
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isLoggedIn: !!accessToken, isLoading: false })
        if (isLocalStorageAvailable()) {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
        }
        try {
          Cookies.set('accessToken', accessToken, { 
            expires: 7, // 7일 후 만료
            path: '/', 
          });
          console.log('[AuthStore] accessToken cookie set attempt. Value right after set:', Cookies.get('accessToken')); // 설정 직후 읽어보기
        } catch (error) {
          console.error('[AuthStore] Error setting accessToken cookie:', error);
        }
      },
      setUser: (user) => {
        set({ user, isLoading: false })
        if (isLocalStorageAvailable()) {
          localStorage.setItem('user', JSON.stringify(user))
        }
      },
      clearAuth: () => {
        const { toast } = useToast.getState()
        set({ accessToken: null, refreshToken: null, user: null, isLoggedIn: false, isLoading: false })
        if (isLocalStorageAvailable()) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
        Cookies.remove('accessToken', { path: '/' });
        
        // 사용자에게 알림
        toast({
          title: "로그아웃",
          description: "세션이 만료되어 자동으로 로그아웃되었습니다. 다시 로그인해주세요.",
          variant: "default", // 또는 "destructive"
        })

        // 메인 페이지로 리디렉션
        if (typeof window !== 'undefined') {
          window.location.href = '/'; 
        }
      },
      initializeAuth: () => {
        set({ isLoading: true })
        const zustandAccessToken = get().accessToken;
        const cookieAccessToken = Cookies.get('accessToken');

        let finalAccessToken = zustandAccessToken || cookieAccessToken || null;
        let finalRefreshToken = null;
        let finalUser = null;

        if (isLocalStorageAvailable()) {
          finalRefreshToken = localStorage.getItem('refreshToken');
          const userString = localStorage.getItem('user');
          if (userString) {
            try {
              finalUser = JSON.parse(userString);
            } catch (e) {
              console.error('Failed to parse user from localStorage', e);
              localStorage.removeItem('user');
            }
          }
        }
        
        if (cookieAccessToken && !zustandAccessToken) {
            finalAccessToken = cookieAccessToken;
        }

        if (finalAccessToken) {
          set({ accessToken: finalAccessToken, refreshToken: finalRefreshToken, user: finalUser, isLoggedIn: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// 앱 초기화 시 (클라이언트 사이드에서) 인증 상태 로드
// typeof window !== 'undefined' 조건은 persist 미들웨어 내부에서도 처리될 수 있으나,
// 명시적으로 클라이언트 환경에서만 호출하도록 보장합니다.
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth()
} 