'use client'

import * as React from 'react'
import { SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CharacterCard } from './CharacterCard'
import { CharacterSearchResult, CharacterSearchResponse } from '@/types/dnf'

const serverOptions = [
  { value: 'all', label: '전체' },
  { value: 'adven', label: '모험단' },
  { value: 'cain', label: '카인' },
  { value: 'diregie', label: '디레지에' },
  { value: 'siroco', label: '시로코' },
  { value: 'prey', label: '프레이' },
  { value: 'casillas', label: '카시야스' },
  { value: 'hilder', label: '힐더' },
  { value: 'anton', label: '안톤' },
  { value: 'bakal', label: '바칼' },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export function MainSearchForm() {
  const [selectedServer, setSelectedServer] = React.useState(serverOptions[0].value)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<CharacterSearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: '검색어 오류',
        description: '검색어를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }
    const serverToSearch = selectedServer === 'adventure' ? 'adventure' : selectedServer;

    setIsLoading(true)
    setError(null)
    setSearchResults([])

    try {
      if (!API_BASE_URL) {
        throw new Error('API 기본 URL이 설정되지 않았습니다.')
      }
      const response = await fetch(`${API_BASE_URL}/api/df/search?server=${serverToSearch}&name=${encodeURIComponent(searchTerm)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `서버 오류: ${response.status}`)
      }

      const data: CharacterSearchResponse = await response.json()

      if (data.rows && data.rows.length > 0) {
        setSearchResults(data.rows)
      } else {
        setSearchResults([])
        toast({
          title: '검색 결과 없음',
          description: '일치하는 캐릭터 또는 모험단을 찾을 수 없습니다.',
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setError(errorMessage)
      toast({
        title: '검색 실패',
        description: errorMessage,
        variant: 'destructive',
      })
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center space-x-2 rounded-lg border border-input bg-card p-2 shadow-lg">
        <Select value={selectedServer} onValueChange={setSelectedServer}>
          <SelectTrigger className="w-[100px] sm:w-[120px] flex-shrink-0 text-sm sm:text-base">
            <SelectValue placeholder="서버 선택" />
          </SelectTrigger>
          <SelectContent>
            {serverOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-sm sm:text-base">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="search"
          placeholder="캐릭터 또는 모험단명 입력"
          className="flex-grow text-base min-w-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
        />
        <Button type="button" onClick={handleSearch} className="flex-shrink-0 px-3 sm:px-4" disabled={isLoading}>
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <SearchIcon className="h-5 w-5 sm:mr-2" />
          )}
          <span className="hidden sm:inline">{isLoading ? '검색 중...' : 'SEARCH'}</span>
        </Button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">오류 발생</CardTitle>
            <CardDescription className="text-destructive/80">{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {isLoading && (
         <div className="text-center py-4">
           <p className="text-muted-foreground">검색 중입니다...</p>
         </div>
      )}

      {!isLoading && !error && searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {searchResults.map((char) => (
            <CharacterCard key={char.characterId} character={char} serverOptions={serverOptions} />
          ))}
        </div>
      )}
      {!isLoading && !error && searchResults.length === 0 && searchTerm && (
         <div className="text-center py-4">
         </div>
      )}
    </div>
  )
} 