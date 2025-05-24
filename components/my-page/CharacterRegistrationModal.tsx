'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CharacterSearchResult, ServerOption } from '@/types/dnf'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Search, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const serverOptions: ServerOption[] = [
  { value: 'all', label: '전체' }, // '전체'는 실제 API에서 지원하지 않을 수 있으므로, 백엔드 확인 필요
  { value: 'adventure', label: '모험단' }, // '모험단' 검색용 ID, 실제로는 'adven'을 사용해야 할 수 있음
  { value: 'cain', label: '카인' },
  { value: 'diregie', label: '디레지에' },
  { value: 'siroco', label: '시로코' },
  { value: 'prey', label: '프레이' },
  { value: 'casillas', label: '카시야스' },
  { value: 'hilder', label: '힐더' },
  { value: 'anton', label: '안톤' },
  { value: 'bakal', label: '바칼' }
]

const searchSchema = z.object({
  server: z.string().min(1, '서버를 선택해주세요.'),
  characterName: z.string().min(2, '두 글자 이상 입력해주세요.')
})

interface CharacterRegistrationModalProps {
  isOpen: boolean
  onCloseAction: () => void
  onCharacterRegisteredAction: (character: CharacterSearchResult) => void
}

export function CharacterRegistrationModal ({ isOpen, onCloseAction, onCharacterRegisteredAction }: CharacterRegistrationModalProps) {
  const { toast } = useToast()
  const [searchResults, setSearchResults] = React.useState<CharacterSearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedCharacter, setSelectedCharacter] = React.useState<CharacterSearchResult | null>(null)

  const { control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { server: '', characterName: '' }
  })

  const onSubmit = async (data: z.infer<typeof searchSchema>) => {
    if (!API_BASE_URL) {
      toast({ title: '오류', description: 'API 요청 주소가 설정되지 않았습니다.', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    setSearchResults([])
    setSelectedCharacter(null)
    try {
      // 실제 API 요청 시 'adventure'는 'adven'으로 변경, 'all'은 지원 여부 확인
      const serverId = data.server === 'adventure' ? 'adven' : data.server
      const response = await fetch(`${API_BASE_URL}/api/df/search?server=${serverId}&name=${data.characterName}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '캐릭터 검색에 실패했습니다.')
      }
      const results = await response.json()
      // API 응답이 CharacterSearchResponse 형태일 경우, results.rows 사용
      const characters = results.rows || (Array.isArray(results) ? results : [])
      setSearchResults(characters)
      if (characters.length === 0) {
        toast({ title: '검색 결과 없음', description: '조건에 맞는 캐릭터를 찾을 수 없습니다.' })
      }
    } catch (error: any) {
      toast({ title: '검색 오류', description: error.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (selectedCharacter) {
      setIsLoading(true);
      try {
        if (!API_BASE_URL) {
          toast({ title: '오류', description: 'API 요청 주소가 설정되지 않았습니다.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('accessToken'); // localStorage에서 토큰 가져오기
        if (!token) {
          toast({ title: '인증 오류', description: '로그인이 필요합니다. 다시 로그인해주세요.', variant: 'destructive' });
          setIsLoading(false);
          // 필요시 로그인 페이지로 리디렉션
          // router.push('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/characters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 헤더에 토큰 추가
          },
          body: JSON.stringify({
            serverId: selectedCharacter.serverId,
            characterName: selectedCharacter.characterName
          })
        });

        const responseText = await response.text(); 
        console.log('Server response text:', responseText); 

        let result;
        try {
          result = JSON.parse(responseText); 
        } catch (e) {
          console.error('JSON parsing error:', e);
          throw new Error(`서버 응답 처리 중 오류가 발생했습니다. Status: ${response.status}, 응답 내용: ${responseText}`);
        }

        if (!response.ok) {
          // 401, 403 등의 인증 오류도 여기서 잡힐 수 있음
          const errorMessage = result.message || `캐릭터 등록에 실패했습니다. (Status: ${response.status})`;
          throw new Error(errorMessage);
        }

        toast({
          title: '캐릭터 등록 성공',
          description: `${result.characterName || selectedCharacter.characterName} (${result.serverId || selectedCharacter.serverId}) 캐릭터가 성공적으로 등록되었습니다.`
        });
        onCharacterRegisteredAction({ 
          ...selectedCharacter, 
          characterId: result.characterId || selectedCharacter.characterId, 
          adventureName: result.adventureName || selectedCharacter.adventureName, 
        });
        onCloseAction(); 
      } catch (error: any) {
        console.error('캐릭터 등록 오류:', error); 
        toast({ title: '캐릭터 등록 오류', description: error.message, variant: 'destructive' });
      } finally {
        setIsLoading(false); 
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] h-full flex flex-col p-0 sm:p-6">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl flex items-center">
            <UserPlus className="mr-2 h-6 w-6 text-primary" /> 새 캐릭터 등록
          </DialogTitle>
          <DialogDescription>
            서버와 캐릭터명을 입력하여 검색한 후, 등록할 캐릭터를 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="p-6 pt-0 pb-3 sm:pb-4 flex-shrink-0"
        >
          <div className="flex flex-row items-center gap-2 sm:grid sm:grid-cols-[1fr_2fr_auto] sm:gap-3 sm:items-end">
            <div className='flex flex-col space-y-1.5 w-[130px] sm:w-auto flex-shrink-0'>
              <Controller
                name="server"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={errors.server ? 'border-red-500' : ''}>
                      <SelectValue placeholder="서버" />
                    </SelectTrigger>
                    <SelectContent>
                      {serverOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.server && <p className="text-xs text-red-500 sm:hidden">{errors.server.message}</p>}
            </div>
            <div className='flex flex-col space-y-1.5 flex-grow min-w-0'>
                <Input 
                  {...control.register("characterName")} 
                  placeholder="캐릭터명/모험단명"
                  className={errors.characterName ? 'border-red-500' : ''}
                />
              {errors.characterName && <p className="text-xs text-red-500 sm:hidden">{errors.characterName.message}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className='flex-shrink-0 px-3 sm:px-4'>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Search className="h-4 w-4 sm:mr-2" />} 
              <span className="hidden sm:inline">검색</span>
            </Button>
          </div>
          {errors.server && <p className="text-xs text-red-500 hidden sm:block">{errors.server.message}</p>}
          {errors.characterName && <p className="text-xs text-red-500 hidden sm:block">{errors.characterName.message}</p>}
        </form>

        <div className="flex-grow overflow-y-auto space-y-2 border-t px-1 sm:px-6 pb-2">
          {searchResults.length > 0 && (
            <div className="pt-4 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">검색 결과 ({searchResults.length}건) - 등록할 캐릭터를 선택하세요.</h3>
              {searchResults.map((char) => (
                <Card 
                  key={`${char.serverId}-${char.characterId}`}
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${selectedCharacter?.characterId === char.characterId && selectedCharacter?.serverId === char.serverId ? 'ring-2 ring-primary bg-muted/30' : ''}`}
                  onClick={() => setSelectedCharacter(char)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image 
                          src={char.imageUrl || '/images/placeholder.png'} 
                          alt={char.characterName} 
                          fill 
                          sizes="48px"
                          className="rounded-md border bg-secondary object-cover aspect-square"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" title={char.characterName}>{char.characterName} <span className="text-xs text-muted-foreground">(Lv.{char.level})</span></p>
                      <p className="text-xs text-muted-foreground truncate">{char.jobGrowName}</p>
                      <p className="text-xs text-muted-foreground truncate">{serverOptions.find(s => s.value === char.serverId)?.label || char.serverId}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {isLoading && searchResults.length === 0 && (
            <div className="flex-grow flex items-center justify-center text-muted-foreground h-full">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 검색 중...
            </div>
          )}
          {!isLoading && searchResults.length === 0 && (
             <div className="flex-grow flex items-center justify-center text-muted-foreground h-full">
               <p>검색 결과가 여기에 표시됩니다.</p>
             </div>
           )}
        </div>

        <DialogFooter className="mt-auto p-6 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onCloseAction}>취소</Button>
          <Button 
            onClick={handleRegister} 
            disabled={!selectedCharacter || isLoading}
            className="min-w-[100px]"
          >
            {isLoading && selectedCharacter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            등록하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 