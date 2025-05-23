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

const serverOptions = [
  { value: 'all', label: '전체' },
  { value: 'adventure', label: '모험단' },
  { value: 'cain', label: '카인' },
  { value: 'diregie', label: '디레지에' },
  { value: 'siroco', label: '시로코' },
  { value: 'prey', label: '프레이' },
  { value: 'casillas', label: '카시야스' },
  { value: 'hilder', label: '힐더' },
  { value: 'anton', label: '안톤' },
  { value: 'bakal', label: '바칼' },
]

export function MainSearchForm() {
  const [selectedServer, setSelectedServer] = React.useState(serverOptions[0].value)
  const [searchTerm, setSearchTerm] = React.useState('')

  const handleSearch = () => {
    // TODO: 검색 로직 구현
    console.log('Search:', { server: selectedServer, term: searchTerm })
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center space-x-2 rounded-lg border border-input bg-card p-2 shadow-lg">
        <Select value={selectedServer} onValueChange={setSelectedServer}>
          <SelectTrigger className="w-24 sm:w-[120px] flex-shrink-0">
            <SelectValue placeholder="서버 선택" />
          </SelectTrigger>
          <SelectContent>
            {serverOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="search"
          placeholder="캐릭터, 모험단, 길드명 입력"
          className="flex-grow text-base min-w-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
        />
        <Button type="button" onClick={handleSearch} className="flex-shrink-0 px-3 sm:px-4">
          <SearchIcon className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">SEARCH</span>
        </Button>
      </div>
    </div>
  )
} 