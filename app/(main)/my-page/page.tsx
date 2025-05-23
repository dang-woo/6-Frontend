'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/authStore'
import { Button } from '@/components/ui/button'

// import { Settings, PlusCircle, Users } from 'lucide-react' // 아이콘 직접 사용 제거
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card' // 직접 사용 제거
// import { Separator } from '@/components/ui/separator' // 직접 사용 제거

import { MyPageHeader } from '@/components/my-page/MyPageHeader'
import { NoCharactersMessage } from '@/components/my-page/NoCharactersMessage'

export default function MyPage() {
  const router = useRouter()
  const { isLoggedIn, user, isLoading } = useAuthStore()

  // const userName = '나동우' // 임시 사용자 이름 (스토어에서 가져오므로 주석 처리 또는 삭제)
  const hasAdventurers = false // 등록된 모험단/캐릭터 여부 (임시)
  const adventurerGroupName = undefined // 임시 모험단 이름 (없을 경우 undefined)

  // 캐릭터 목록이 있을 경우를 위한 상태 (지금은 사용되지 않음)
  // const [characters, setCharacters] = React.useState([]) 

  if (isLoading) {
    // 로딩 중에는 아무것도 표시하지 않거나 스켈레톤 UI를 표시할 수 있습니다.
    return <div className="container mx-auto py-8 px-4 md:px-6">Loading...</div>
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">로그인이 필요한 서비스입니다.</h2>
          <p className="mb-8 text-muted-foreground">마이페이지를 이용하시려면 먼저 로그인해주세요.</p>
          <Button onClick={() => router.push('/login')}>로그인 하러가기</Button>
        </div>
      </div>
    )
  }

  // 로그인한 사용자에게만 보이는 마이페이지 내용
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <MyPageHeader 
        userName={user?.nickname || '사용자'} // 스토어의 사용자 닉네임 사용
        hasAdventurers={hasAdventurers} 
        adventurerGroupName={adventurerGroupName} 
      />

      {/* 캐릭터 목록 유무에 따라 다른 컴포넌트 렌더링 */} 
      {hasAdventurers /* && characters.length > 0 */ ? (
        <section>
          {/* 여기에 캐릭터 목록을 표시하는 컴포넌트가 들어갈 수 있습니다. */}
          <p>등록된 캐릭터 목록이 여기에 표시됩니다.</p>
        </section>
      ) : (
        <NoCharactersMessage />
      )}
    </div>
  )
}
