'use client'

import * as React from 'react'

// import { Settings, PlusCircle, Users } from 'lucide-react' // 아이콘 직접 사용 제거
// import { Button } from '@/components/ui/button' // 직접 사용 제거
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card' // 직접 사용 제거
// import { Separator } from '@/components/ui/separator' // 직접 사용 제거

import { MyPageHeader } from '@/components/my-page/MyPageHeader'
import { NoCharactersMessage } from '@/components/my-page/NoCharactersMessage'

export default function MyPage() {
  // 실제 사용자 이름과 모험단 데이터는 API 연동 후 가져와야 합니다.
  const userName = '나동우' // 임시 사용자 이름
  const hasAdventurers = false // 등록된 모험단/캐릭터 여부 (임시)
  const adventurerGroupName = undefined // 임시 모험단 이름 (없을 경우 undefined)

  // 캐릭터 목록이 있을 경우를 위한 상태 (지금은 사용되지 않음)
  // const [characters, setCharacters] = React.useState([]) 

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <MyPageHeader 
        userName={userName} 
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
