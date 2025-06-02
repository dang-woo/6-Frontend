'use client'

import { useState, useRef, useEffect } from 'react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PaperPlaneIcon } from '@/components/icons/PaperPlaneIcon' // 전송 아이콘 (커스텀 아이콘 필요 시)
import { X, Loader2, RefreshCcw, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date // 시간 기록을 위한 필드 추가
  isLoading?: boolean // AI 응답 로딩 상태를 위한 플래그
}

interface ChatWindowProps {
  characterId: string // 캐릭터 ID prop 추가
  onClose: () => void
}

// 시간 포맷팅 함수
function formatTime(date: Date) {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// 텍스트 포매팅 함수 추가
function formatMessageText(text: string): (string | React.JSX.Element)[] | string {
  if (!text) return '';

  const parts = text.split(/(\*{2}.+?\*{2})/g); // **text** 패턴으로 분리
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    // white-space: pre-wrap 이 이미 적용되어 있으므로,
    // 명시적인 <br /> 태그 변환은 주석 처리합니다.
    // 필요시 아래 로직을 활성화하고 React.Fragment 등을 사용하세요.
    /*
    const lines = part.split('\n');
    return (
      <span key={index}>
        {lines.map((line, i) => (
          <React.Fragment key={`line-${index}-${i}`}> 
            {line}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
    );
    */
    return part; 
  });
}

const AI_LOADING_MESSAGE_ID = 'ai-loading-message';

export function ChatWindow({ characterId, onClose }: ChatWindowProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('')
  const [aiResponseCount, setAiResponseCount] = useState(0) // AI 응답 횟수 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [isClearingChat, setIsClearingChat] = useState(false); // 채팅 초기화 로딩 상태
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // characterId가 변경될 때 localStorage에서 대화 기록 로드 및 초기 메시지 설정
  useEffect(() => {
    const storedMessages = localStorage.getItem(`chatHistory_${characterId}`);
    if (storedMessages) {
      try {
        const parsedMessagesFromStorage = JSON.parse(storedMessages) as Message[];
        const messagesWithDateObjects = parsedMessagesFromStorage.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp) // 문자열을 Date 객체로 변환
        }));
        // isLoading 플래그가 true로 저장된 메시지가 있을 경우 제거 (예: 브라우저 강제 종료)
        setMessages(messagesWithDateObjects.filter(msg => !msg.isLoading));
      } catch (error) {
        console.error('Error parsing stored messages from localStorage or converting timestamp:', error);
        // 파싱 오류 시 기본 초기 메시지로 설정
        setMessages([{ id: '1', text: '안녕하세요! 무엇을 도와드릴까요?', sender: 'ai', timestamp: new Date() }]);
      }
    } else {
      setMessages([{ id: '1', text: '안녕하세요! 무엇을 도와드릴까요?', sender: 'ai', timestamp: new Date() }]);
    }
    // characterId가 바뀌면 AI 응답 횟수도 초기화되어야 할 수 있습니다. (정책에 따라 결정)
    // setAiResponseCount(0); // 필요시 주석 해제
  }, [characterId]);

  // messages 상태가 변경될 때 localStorage에 저장 (AI 로딩 메시지 제외)
  useEffect(() => {
    // 초기 로드 시 messages가 빈 배열일 수 있으므로, 빈 배열 저장을 방지
    if (messages.length > 0) {
      const messagesToStore = messages.filter(msg => msg.id !== AI_LOADING_MESSAGE_ID);
      localStorage.setItem(`chatHistory_${characterId}`, JSON.stringify(messagesToStore));
    } else {
      // 메시지가 비어있다면 (예: 초기화 직후 아직 메시지 없는 상태) 로컬 스토리지에서도 해당 characterId의 기록을 지울 수 있습니다.
      // 또는, 초기 메시지가 항상 있도록 하려면 이 로직은 필요 없습니다.
      // 현재는 messages.length > 0 조건 때문에 빈 배열이 저장되는 것을 막고 있습니다.
      // 만약 사용자가 모든 메시지를 지우고 창을 닫았다가 다시 열었을 때 빈 상태를 원한다면,
      // 이 else 블록에서 localStorage.removeItem(`chatHistory_${characterId}`)를 호출할 수 있습니다.
      // 하지만 현재는 첫 메시지가 항상 있도록 위에서 처리하고 있으므로, 여기서는 특별한 동작을 하지 않습니다.
    }
  }, [messages, characterId]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return // 로딩 중이면 전송 방지

    const token = localStorage.getItem('accessToken'); // 예시: localStorage에서 토큰 가져오기
    if (!token) {
      // TODO: 좀 더 나은 UI/UX로 사용자에게 알림 (예: 토스트 메시지, 모달 등)
      alert('채팅을 이용하려면 로그인이 필요합니다.');
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now().toString() + '-auth-error',
        text: '채팅을 이용하려면 로그인이 필요합니다. 로그인 후 다시 시도해주세요.',
        sender: 'ai',
        timestamp: new Date()
      }]);
      return;
    }

    const userMessageText = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    }
    
    // AI 응답 대기 메시지 추가
    const loadingMessage: Message = {
      id: AI_LOADING_MESSAGE_ID,
      text: 'AI가 답변을 생성 중입니다...',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prevMessages => [...prevMessages, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      // 위에서 이미 토큰 유무를 확인했으므로, 여기서는 바로 할당합니다.
      headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`/api/df/chat?characterId=${characterId}&questionMessage=${encodeURIComponent(userMessageText)}`, {
        method: 'POST',
        headers, 
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // TODO: 좀 더 나은 UI/UX (토스트, 모달 등) 및 로그아웃 처리 또는 로그인 페이지 이동 유도
          alert('인증에 실패했습니다. 다시 로그인해주세요.');
          setMessages(prevMessages => [...prevMessages, {
            id: Date.now().toString() + '-auth-fail',
            text: '인증 정보가 유효하지 않습니다. 다시 로그인 후 시도해주세요.',
            sender: 'ai',
            timestamp: new Date()
          }]);
        } else {
          console.error('AI 채팅 API 호출 실패:', response.statusText);
          const errorData = await response.json().catch(() => ({})); // 오류 응답 파싱 시도
          const errorMessage = errorData?.error || errorData?.message || '죄송합니다, 메시지 처리에 실패했습니다. 다시 시도해주세요.';
          const errorResponse: Message = {
            id: Date.now().toString() + '-error',
            text: errorMessage,
            sender: 'ai',
            timestamp: new Date()
          }
          setMessages(prevMessages => [...prevMessages, errorResponse]);
        }
        return;
      }

      const data = await response.json(); // data is ResponseAIDTO

      if (data.answer) { // AI의 답변이 있는 경우
        const aiResponseMessage: Message = {
          id: Date.now().toString() + '-ai',
          text: data.answer,
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prevMessages => [...prevMessages, aiResponseMessage]);
        setAiResponseCount(prevCount => prevCount + 1);

        // 백엔드가 answer와 함께 한도 관련 message를 보낼 수도 있지만,
        // 현재 DFController 로직 상으로는 answer가 있으면 한도 메시지는 별도로 처리하지 않는 것으로 보임.
        // 만약 함께 온다면 아래와 같이 처리 가능
        /*
        if (data.message && data.message.includes('채팅창 한도에 도달했습니다')) {
           const limitMessageText = data.message.includes('초기화됩니다') ? data.message : '채팅창 한도에 도달했습니다. 새로운 대화를 시작해주세요.';
           const limitMessage: Message = {
            id: Date.now().toString() + '-limit',
            text: limitMessageText,
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, limitMessage]);
          if (data.message.includes('초기화됩니다')) {
            setAiResponseCount(0);
          }
        }
        */
      } else if (data.message && data.message.includes('채팅창 한도에 도달했습니다')) { // 답변은 없고, 한도 초과 메시지만 있는 경우
        const resetMessage: Message = {
          id: Date.now().toString() + '-reset',
          text: data.message, // "채팅창 한도에 도달했습니다. 채팅 내역이 초기화됩니다."
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prevMessages => [...prevMessages, resetMessage, {
          id: 'reset-prompt',
          text: '새로운 대화를 시작해주세요.',
          sender: 'ai',
          timestamp: new Date()
        }])
        setAiResponseCount(0); // 한도 초과로 초기화되었으므로 카운트 리셋
      } else {
        // AI 응답도 없고, 특정 한도 초과 메시지도 아닌 경우 (예: 다른 오류 메시지 또는 예상치 못한 응답)
        const unexpectedResponse: Message = {
          id: Date.now().toString() + '-ai-error',
          text: data.message || 'AI 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.',
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prevMessages => [...prevMessages, unexpectedResponse]);
      }

    } catch (error) {
      // TODO: 네트워크 오류 등 예외 처리
      console.error('AI 채팅 중 오류 발생:', error);
      const errorResponse: Message = {
        id: Date.now().toString() + '-exception',
        text: '메시지 전송 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setMessages(prev => prev.filter(msg => msg.id !== AI_LOADING_MESSAGE_ID));
      setIsLoading(false);
    }
  }

  const handleClearChat = async () => {
    if (!confirm('정말로 채팅 내역을 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast({ title: '인증 오류', description: '채팅 내역을 삭제하려면 로그인이 필요합니다.', variant: 'destructive' });
      return;
    }

    setIsClearingChat(true);
    try {
      const response = await fetch(`/api/df/chat?characterId=${characterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages([
          { id: '1', text: '안녕하세요! 무엇을 도와드릴까요?', sender: 'ai', timestamp: new Date() },
          { id: 'cleared', text: '채팅 내역이 초기화되었습니다.', sender: 'ai', timestamp: new Date() }
        ]);
        setAiResponseCount(0);
        localStorage.removeItem(`chatHistory_${characterId}`); // localStorage에서도 삭제
        toast({ title: '채팅 초기화 완료', description: '채팅 내역이 성공적으로 삭제되었습니다.'});
      } else {
        const errorData = await response.json().catch(() => ({ message: '채팅 내역 삭제에 실패했습니다.'}));
        toast({ title: '초기화 실패', description: errorData.message || '채팅 내역 삭제 중 오류가 발생했습니다.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: '네트워크 오류', description: '채팅 내역 삭제 중 네트워크 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setIsClearingChat(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 기본 Enter 동작 (줄바꿈 등) 방지
      handleSendMessage();
    }
  };

  useEffect(() => {
    // 새 메시지가 추가될 때 스크롤을 맨 아래로 이동
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scrollarea-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div 
      className={`
        fixed z-[100] flex flex-col bg-background shadow-xl border
        inset-0 sm:inset-auto 
        sm:bottom-[calc(2rem+3.5rem+0.5rem)] sm:right-8 
        sm:w-[380px] sm:h-[500px] 
        sm:max-h-[calc(100vh-10rem)] 
        sm:rounded-lg
      `}
    >
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-background z-10">
        <h3 className="text-lg font-semibold">AI 캐릭터 상담</h3>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClearChat} 
            disabled={isClearingChat || isLoading}
            aria-label="대화 내용 전체 삭제"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="채팅창 닫기" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 sm:p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm sm:text-base shadow ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground self-end'
                  : 'bg-muted text-muted-foreground self-start'
              } ${msg.isLoading ? 'flex items-center' : ''}`}
            >
              {msg.isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <div className="whitespace-pre-wrap break-words">
                {formatMessageText(msg.text)}
              </div>
            </div>
            <span className="text-xs text-gray-400 px-1">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        ))}
      </ScrollArea>

      <div className="p-3 border-t bg-background sticky bottom-0 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2"
        >
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 text-sm sm:text-base"
            disabled={isLoading || isClearingChat}
            aria-label="채팅 메시지 입력"
          />
          <Button type="submit" size="icon" disabled={isLoading || inputValue.trim() === '' || isClearingChat} aria-label="메시지 전송">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PaperPlaneIcon className="h-5 w-5" />}
          </Button>
        </form>
        {aiResponseCount >= 5 && (
          <p className="text-xs text-muted-foreground mt-1 text-center">
            AI 응답은 현재 세션에서 최대 10회까지 가능합니다. (현재: {aiResponseCount}회)
          </p>
        )}
      </div>
    </div>
  )
} 