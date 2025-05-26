'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, X } from 'lucide-react'
import { ChatWindow } from './ChatWindow'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface FloatingChatButtonProps {
  characterId: string;
}

export function FloatingChatButton({ characterId }: FloatingChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 640)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleChatWindow = () => {
    setIsChatOpen(!isChatOpen)
  }

  const buttonContent = (
    <>
      {isDesktop ? (
        <Bot className="h-7 w-7" />
      ) : isChatOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Bot className="h-5 w-5" />
      )}

      {!isChatOpen && !isDesktop && (
        <span className="text-sm font-medium">AI 채팅</span>
      )}
    </>
  )

  const buttonClassName = `fixed z-50 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg
    ${isDesktop 
      ? 'bottom-8 right-8 h-14 w-14 rounded-full flex items-center justify-center p-0' 
      : 'bottom-4 right-4 h-auto w-auto p-3 rounded-md flex items-center space-x-2'}
    ${isChatOpen && !isDesktop ? 'hidden' : 'flex'}
  `

  return (
    <>
      {isDesktop ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              className={buttonClassName}
              onClick={toggleChatWindow}
              aria-label={isChatOpen ? 'AI 채팅 닫기' : 'AI 채팅 열기'}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          {!isChatOpen && (
            <TooltipContent side="left" className="bg-foreground text-background">
              <p>AI에게 상담받기</p>
            </TooltipContent>
          )}
        </Tooltip>
      ) : (
        <Button 
          variant="outline" 
          className={buttonClassName}
          onClick={toggleChatWindow}
          aria-label={isChatOpen ? 'AI 채팅 닫기' : 'AI 채팅 열기'}
        >
          {buttonContent}
        </Button>
      )}
      
      {isChatOpen && <ChatWindow characterId={characterId} onClose={toggleChatWindow} />}
    </>
  )
} 