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

const MIN_CHAT_WIDTH = 320; // 최소 너비 (px)
const MIN_CHAT_HEIGHT = 300; // 최소 높이 (px)

export function ChatWindow({ characterId, onClose }: ChatWindowProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 새로 추가된 상태 변수들
  const [characterUsedCount, setCharacterUsedCount] = useState(0); // 캐릭터가 사용한 횟수
  const [accountRemaining, setAccountRemaining] = useState<number | null>(null); // 계정 전체 남은 횟수
  const [chatLimitMessage, setChatLimitMessage] = useState<string | null>(null); // 한도 관련 안내 메시지

  // State for resizable chat window (PC only)
  const chatWindowRef = useRef<HTMLDivElement>(null); // 채팅창 전체를 참조
  const [isResizing, setIsResizing] = useState(false);
  const [chatWindowSize, setChatWindowSize] = useState({ width: 380, height: 500 }); // 초기 PC 크기
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [isMobileView, setIsMobileView] = useState(false); // 모바일 뷰인지 확인

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 640); // sm 브레이크포인트 기준
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Function to fetch initial chat limits or state if needed when characterId changes
  // This could be an API call or derived from existing data
  const fetchInitialChatState = async (charId: string) => {
    // Placeholder: 실제로는 여기서 API를 호출하여 초기 횟수/한도 정보를 가져올 수 있습니다.
    // 예를 들어, 사용자가 이전에 이 캐릭터와 채팅한 기록이 서버에 있다면,
    // 그 때의 characterUsedCount, accountRemaining 등을 가져올 수 있습니다.
    // 지금은 characterId 변경 시 0과 null로 초기화하고, 첫 메시지 전송 시 값을 받습니다.
    // 만약 페이지 로드 시점에 채팅 횟수를 알아야 한다면, 이 함수를 채우거나
    // page.tsx 등 부모 컴포넌트에서 정보를 받아 props로 넘겨야 합니다.
    // 우선은 메시지 전송 시 받는 정보로 업데이트하는 현재 로직을 유지합니다.
    console.log('Fetching initial chat state for', charId); // 실제 구현 시 이 부분 수정
    // 예시: setCharacterUsedCount(fetchedUsedCount); setAccountRemaining(fetchedAccountRemaining);
  };

  useEffect(() => {
    const storedMessages = localStorage.getItem(`chatHistory_${characterId}`);
    if (storedMessages) {
      try {
        const parsedMessagesFromStorage = JSON.parse(storedMessages) as Message[];
        const messagesWithDateObjects = parsedMessagesFromStorage.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDateObjects.filter(msg => !msg.isLoading));
      } catch (error) {
        console.error('Error parsing stored messages or converting timestamp:', error);
        setMessages([{ id: '1', text: '안녕하세요! 무엇을 도와드릴까요?', sender: 'ai', timestamp: new Date() }]);
      }
    } else {
      setMessages([{ id: '1', text: '안녕하세요! 무엇을 도와드릴까요?', sender: 'ai', timestamp: new Date() }]);
    }
    setCharacterUsedCount(0);
    setAccountRemaining(null); 
    setChatLimitMessage(null);
    fetchInitialChatState(characterId); // 초기 상태 가져오기 호출
  }, [characterId]);

  useEffect(() => {
    if (messages.length > 0) {
      const messagesToStore = messages.filter(msg => msg.id !== AI_LOADING_MESSAGE_ID);
      localStorage.setItem(`chatHistory_${characterId}`, JSON.stringify(messagesToStore));
    } 
  }, [messages, characterId]);

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobileView) return;
    e.preventDefault(); // 기본 동작 방지 (예: 텍스트 선택)
    setIsResizing(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    if (chatWindowRef.current) {
      setInitialSize({
        width: chatWindowRef.current.offsetWidth,
        height: chatWindowRef.current.offsetHeight,
      });
    }
  };

  useEffect(() => {
    if (isMobileView || !isResizing) return;

    const handleResizeMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;
      // 왼쪽 상단 핸들이므로, 마우스 이동 방향의 반대로 크기 변경
      let newWidth = initialSize.width - dx;
      let newHeight = initialSize.height - dy;

      // 최소/최대 크기 제한 (선택 사항)
      newWidth = Math.max(MIN_CHAT_WIDTH, newWidth);
      newHeight = Math.max(MIN_CHAT_HEIGHT, newHeight);
      // newWidth = Math.min(window.innerWidth - chatWindowRef.current?.offsetLeft || 0, newWidth); // 최대 너비 제한
      // newHeight = Math.min(window.innerHeight - chatWindowRef.current?.offsetTop || 0, newHeight); // 최대 높이 제한

      setChatWindowSize({ width: newWidth, height: newHeight });
    };

    const handleResizeMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [isResizing, initialMousePos, initialSize, isMobileView]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading || isClearingChat || characterUsedCount >= 5 || (accountRemaining !== null && accountRemaining <= 0)) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast({ title: '로그인 필요', description: '채팅을 이용하려면 로그인이 필요합니다.', variant: 'destructive' });
      setMessages(prev => [...prev, { id: Date.now().toString(), text: '로그인이 필요합니다.', sender: 'ai', timestamp: new Date() }]);
      return;
    }

    const userMessageText = inputValue.trim();
    const userMessage: Message = { id: Date.now().toString(), text: userMessageText, sender: 'user', timestamp: new Date() };
    const loadingMessage: Message = { id: AI_LOADING_MESSAGE_ID, text: 'AI가 답변을 생성 중입니다...', sender: 'ai', timestamp: new Date(), isLoading: true };
    
    setMessages(prevMessages => [...prevMessages, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);
    setChatLimitMessage(null); // 이전 한도 메시지 초기화

    try {
      const response = await fetch(`/api/df/chat?characterId=${characterId}&questionMessage=${encodeURIComponent(userMessageText)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      // 로딩 메시지 제거는 finally로 이동
      // setMessages(prev => prev.filter(msg => msg.id !== AI_LOADING_MESSAGE_ID)); 

      const data = await response.json(); // success, message, answer, aiRequestCount, accountRemainingCount 등 포함 가능

      if (!response.ok) {
        // HTTP 에러 상태 (4xx, 5xx). data 객체는 백엔드가 보낸 오류 메시지를 포함할 수 있음
        const errMsg = data?.message || data?.error || '메시지 처리 중 오류가 발생했습니다.';
        setMessages(prev => [...prev.filter(m => m.id !== AI_LOADING_MESSAGE_ID), { id: Date.now().toString(), text: errMsg, sender: 'ai', timestamp: new Date() }]);
        setChatLimitMessage(errMsg); // 오류 메시지를 한도 메시지로 표시
        if (data?.accountRemainingCount !== undefined) setAccountRemaining(data.accountRemainingCount);
        // characterUsedCount는 오류 시 보통 변경되지 않거나, 백엔드가 명시적으로 알려줘야 함
        if (data?.aiRequestCount !== undefined) setCharacterUsedCount(data.aiRequestCount);
        else if (data?.characterRemainingCount === 0) setCharacterUsedCount(5);
        return; // 여기서 함수 종료
      }
      
      // 응답 성공 (response.ok === true)
      // data는 ResponseAIDTO 또는 성공 시의 Map 객체 (컨트롤러 로직에 따라 다름)
      // 컨트롤러에서는 성공 시 ResponseAIDTO를 body로 감싸서 보냄

      if (data.answer) {
        const aiResponseMessage: Message = { id: Date.now().toString() + '-ai', text: data.answer, sender: 'ai', timestamp: new Date() };
        setMessages(prev => [...prev.filter(m => m.id !== AI_LOADING_MESSAGE_ID), aiResponseMessage]);
      } else if (data.message && !data.success) {
         // data.success가 false이고, answer는 없지만 message가 있는 경우 (주로 한도 도달 시)
        const limitInfoMessage: Message = { id: Date.now().toString() + '-limitinfo', text: data.message, sender: 'ai', timestamp: new Date() }; 
        setMessages(prev => [...prev.filter(m => m.id !== AI_LOADING_MESSAGE_ID), limitInfoMessage]);
        setChatLimitMessage(data.message);
      }
      // 성공했으므로 항상 횟수 업데이트 시도
      setCharacterUsedCount(data.aiRequestCount || characterUsedCount); // 기존 값 유지 또는 업데이트
      setAccountRemaining(data.accountRemainingCount !== undefined ? data.accountRemainingCount : accountRemaining);

      // 추가적인 한도 메시지 처리 (data.limitMessage 또는 횟수 기반)
      if (data.limitMessage) {
        setChatLimitMessage(data.limitMessage);
      } else if (data.aiRequestCount >= 5) {
        setChatLimitMessage("캐릭터의 일일 채팅 한도(5회)에 도달했습니다. 내일 다시 시도해주세요.");
      } else if (data.accountRemainingCount !== undefined && data.accountRemainingCount <= 0) {
        setChatLimitMessage("계정의 일일 AI 채팅 한도(20회)에 도달했습니다. 내일 다시 시도해주세요.");
      }

    } catch (error) {
      console.error('AI 채팅 중 네트워크 또는 JSON 파싱 오류 발생:', error);
      const errorResponse: Message = { id: Date.now().toString(), text: '메시지 전송/응답 처리 중 오류가 발생했습니다.', sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev.filter(m => m.id !== AI_LOADING_MESSAGE_ID), errorResponse]);
      setChatLimitMessage('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setMessages(prev => prev.filter(msg => msg.id !== AI_LOADING_MESSAGE_ID));
      setIsLoading(false);
    }
  };

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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setMessages([
          { id: '1', text: '안녕하세요! 무엇을 도와드릴까요?', sender: 'ai', timestamp: new Date() },
          { id: 'cleared', text: '채팅 내역이 초기화되었습니다.', sender: 'ai', timestamp: new Date() }
        ]);
        setCharacterUsedCount(0); // 캐릭터 사용 횟수 초기화
        setChatLimitMessage(null);    // 한도 메시지 없음으로 설정
        // accountRemaining은 초기화하지 않음 (계정 전체 한도는 유지)
        localStorage.removeItem(`chatHistory_${characterId}`);
        toast({ title: '채팅 초기화 완료', description: '채팅 내역이 성공적으로 삭제되었습니다.'});
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.message || '채팅 내역 삭제 중 오류가 발생했습니다.';
        toast({ title: '초기화 실패', description: errMsg, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: '네트워크 오류', description: '채팅 내역 삭제 중 네트워크 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setIsClearingChat(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scrollarea-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const isInputDisabled = isLoading || isClearingChat || characterUsedCount >= 5 || (accountRemaining !== null && accountRemaining <= 0) || (chatLimitMessage !== null && chatLimitMessage.includes('한도'));

  // Dynamic style for the chat window based on isMobileView and chatWindowSize
  const getChatWindowStyle = () => {
    if (isMobileView) {
      return { inset: '0px' }; // 모바일에서는 전체 화면
    }
    // PC에서는 크기 조절된 값 또는 기본값 사용
    // sm:bottom-[calc(2rem+3.5rem+0.5rem)] sm:right-8 등 위치 스타일은 className으로 처리
    return {
      width: `${chatWindowSize.width}px`,
      height: `${chatWindowSize.height}px`,
    };
  };

  return (
    <div 
      ref={chatWindowRef}
      className={`
        fixed z-[100] flex flex-col bg-background shadow-xl border
        ${isMobileView 
          ? 'inset-0 rounded-none' 
          : 'sm:bottom-[calc(2rem+3.5rem+0.5rem)] sm:right-8 sm:rounded-lg'
        }
        ${isResizing ? 'cursor-grabbing' : ''} // 크기 조절 중 커서 변경 (선택 사항)
      `}
      style={getChatWindowStyle()} // 동적 스타일 적용
    >
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-background z-10 cursor-default select-none">
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

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 sm:p-4 space-y-3 select-none">
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

      <div className="p-3 border-t bg-background sticky bottom-0 z-10 select-none">
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
            disabled={isInputDisabled}
            aria-label="채팅 메시지 입력"
          />
          <Button type="submit" size="icon" disabled={isInputDisabled || inputValue.trim() === ''} aria-label="메시지 전송">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PaperPlaneIcon className="h-5 w-5" />}
          </Button>
        </form>
        <div className="mt-1.5 text-center text-xs">
          {chatLimitMessage && (
            <p className="text-destructive">{chatLimitMessage}</p>
          )}
          {!chatLimitMessage && (accountRemaining !== null || characterUsedCount >= 0) && (
            <p className="text-muted-foreground">
              캐릭터: {characterUsedCount}/5회 | 계정: {accountRemaining === null ? '-' : accountRemaining}회 남음
            </p>
          )}
        </div>
      </div>

      {/* Resizer Handle (PC View Only) */}
      {!isMobileView && (
        <div
          onMouseDown={handleResizeMouseDown} // 이벤트 핸들러 연결
          className={`
            absolute top-0 left-0 w-4 h-4 cursor-nwse-resize bg-transparent
            hover:bg-primary/20 active:bg-primary/30
            touch-none select-none // 터치 및 선택 방지
          `}
          title="크기 조절"
          style={{ zIndex: 110 }}
        >
          <svg viewBox="0 0 10 10" className="w-full h-full fill-current text-muted-foreground opacity-50 pointer-events-none">
            {/* 왼쪽 상단 핸들에 맞는 SVG 아이콘 (기존 것과 유사하게 대각선으로 표현) */}
            <path d="M 0 10 L 10 0 L 8 0 L 0 8 Z M 4 0 L 0 4 L 0 6 L 6 0 Z M 0 0 L 10 10 L 10 8 L 2 0 Z" />
          </svg>
        </div>
      )}
    </div>
  )
} 