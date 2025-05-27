'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 승리 조건 체크 함수 (컴포넌트 외부 또는 유틸리티로 분리 가능)
const checkWinner = (board: (string | null)[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 행
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 열
    [0, 4, 8], [2, 4, 6] // 대각선
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // 'X' 또는 'O' 반환
    }
  }
  return board.every(cell => cell) ? 'draw' : null; // 무승부 또는 게임 진행 중
};

export function TicTacToeGame({ onClose }: { onClose: () => void }) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [message, setMessage] = useState("플레이어 X의 턴");
  const [gameOver, setGameOver] = useState(false);

  // AI 턴 (랜덤 선택)
  const makeAIMove = (currentBoard: (string | null)[]) => {
    if (gameOver) return; // 게임 종료 시 AI 움직임 방지

    const newBoard = [...currentBoard];
    const emptyCells = newBoard
      .map((cell, index) => (cell === null ? index : null))
      .filter(val => val !== null) as number[];

    if (emptyCells.length > 0) {
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      newBoard[randomIndex] = 'O';
      setBoard(newBoard); // AI가 둔 후의 보드로 업데이트
      
      const winner = checkWinner(newBoard);
      if (winner) {
        setGameOver(true);
        setMessage(winner === 'draw' ? "무승부! 404도 이기진 못했네!" : `O 승리! 개발자가 이겼다!`);
      } else {
        setCurrentPlayer('X');
        setMessage("플레이어 X의 턴");
      }
    }
  };

  // 셀 클릭 핸들러
  const handleClick = (index: number) => {
    if (board[index] || gameOver || currentPlayer === 'O') return; // AI 턴일 때는 클릭 방지

    const newBoard = [...board];
    newBoard[index] = 'X'; // 플레이어는 항상 'X'
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setGameOver(true);
      setMessage(winner === 'draw' ? "무승부! 404도 이기진 못했네!" : `X 승리! 404를 이겼다!`);
      return;
    }
    
    setCurrentPlayer('O');
    setMessage("AI O의 턴..."); // AI 턴임을 명시적으로 표시
    // 약간의 지연 후 AI 턴 실행
    setTimeout(() => makeAIMove(newBoard), 700); 
  };

  // 게임 리셋
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setMessage("플레이어 X의 턴");
    setGameOver(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-1 text-indigo-600">비밀의 틱-택-토!</h2>
        <p className="text-gray-500 mb-4 text-sm">이런, 404 페이지에서 길을 잃으셨군요! <br/> 대신 개발자가 숨겨둔 게임 한 판 어때요?</p>
        
        <div 
          className={`message text-lg mb-3 font-semibold p-2 rounded-md
                      ${gameOver && message.includes('승리') ? (message.includes('X 승리') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 
                        gameOver && message.includes('무승부') ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-blue-100 text-blue-700'}`}
        >
          {message}
        </div>

        <div className="board grid grid-cols-3 gap-2 mb-4 mx-auto w-[210px] sm:w-[240px]">
          {board.map((cell, index) => (
            <div
              key={index}
              className={`cell w-[62px] h-[62px] sm:w-[72px] sm:h-[72px] rounded-md 
                          flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-150 ease-in-out
                          ${cell === 'X' ? 'text-pink-500 bg-pink-50 hover:bg-pink-100' : 
                            cell === 'O' ? 'text-cyan-500 bg-cyan-50 hover:bg-cyan-100' : 
                            'bg-gray-200 hover:bg-gray-300'}
                          ${(gameOver || board[index] || currentPlayer === 'O') ? 'cursor-not-allowed opacity-70' : ''}
                          `}
              onClick={() => handleClick(index)}
              aria-label={`Tic Tac Toe cell ${index + 1} ${cell ? `contains ${cell}` : 'empty'}`}
              role="button"
              tabIndex={ (gameOver || board[index] || currentPlayer === 'O') ? -1 : 0 }
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(index);}}
            >
              {cell}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-3">
          <button
            className="bg-indigo-500 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm font-medium"
            onClick={resetGame}
            aria-label="게임 다시 시작"
          >
            다시 시작
          </button>
          <Link href="/" passHref legacyBehavior>
            <a className="bg-gray-500 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-sm font-medium no-underline">
              홈으로
            </a>
          </Link>
          {/* <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            onClick={onClose} // 일반 404 페이지로 돌아가는 기능 (선택적)
            aria-label="게임 닫고 404 페이지 보기"
          >
            게임 그만하기
          </button> */}
        </div>
      </div>
    </div>
  );
} 