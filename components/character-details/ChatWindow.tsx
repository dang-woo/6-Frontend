'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PaperPlaneIcon } from '@/components/icons/PaperPlaneIcon' // 전송 아이콘 (커스텀 아이콘 필요 시)
import { X } from 'lucide-react';

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date // 시간 기록을 위한 필드 추가
}

interface ChatWindowProps {

  onClose: () => void
}

// 시간 포맷팅 함수
function formatTime(date: Date) {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '안녕하세요! 무엇을 도와드릴까요?', sender: 'ai', timestamp: new Date() }
  ])
  const [inputValue, setInputValue] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date() // 사용자 메시지 시간 기록
    }
    setMessages(prevMessages => [...prevMessages, newMessage])
    setInputValue('')

    // TODO: AI 응답 로직 (여기서는 임시로 AI 응답을 시뮬레이션)
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString() + '-ai',
        text: `"${newMessage.text}" 라고 말씀하셨네요. 저는 아직 실제 답변을 드릴 수 없어요.`,
        sender: 'ai',
        timestamp: new Date() // AI 메시지 시간 기록
      }
      setMessages(prevMessages => [...prevMessages, aiResponse])
    }, 1000)
  }

  useEffect(() => {
    // 새 메시지가 추가될 때 스크롤을 맨 아래로 이동
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages])

  return (
    <div className={`fixed bg-background border-border shadow-xl flex flex-col z-[100] 
                    sm:w-full sm:max-w-sm sm:h-[70vh] sm:max-h-[800px] sm:rounded-lg sm:border sm:bottom-24 sm:right-8 
                    inset-0 sm:inset-auto rounded-none border-0`}>
      <div className="p-3 border-b flex justify-between items-center bg-muted/40">
        <h3 className="font-semibold text-lg">AI 채팅</h3>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="챗창 닫기">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col items-start max-w-[85%] mb-4 ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto'}`}>
            <div
              className={`px-3 py-2 rounded-xl text-sm break-words 
                ${msg.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'}`
              }
            >
              {msg.text}
            </div>
            {/* 시간 표시 */}
            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-muted-foreground/80' : 'text-muted-foreground/80 ml-1'}`}>
              {formatTime(msg.timestamp)}
            </p>
          </div>
        ))}
      </ScrollArea>

      <div className="p-3 border-t bg-muted/20">
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            handleSendMessage(); 
          }}
          className="flex items-center gap-2"
        >
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-grow"
            autoFocus
          />
          <Button 
            type="submit" 
            aria-label="메시지 전송" 
            disabled={!inputValue.trim()}
            className="h-10 w-10 p-0 flex items-center justify-center flex-shrink-0 rounded-md"
          >
            <PaperPlaneIcon className="h-5 w-5" /> 
          </Button>
        </form>
      </div>
    </div>
  )
} 