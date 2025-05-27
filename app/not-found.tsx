'use client'

import { useState, useEffect } from 'react';
import { NotFoundPage } from '@/components/common/NotFoundPage';
import { TicTacToeGame } from '@/components/common/TicTacToeGame';
import Head from 'next/head';

export default function NotFound() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    if (Math.random() < 0.3) {
      setShowEasterEgg(true);
      setShowGame(true);
    } else {
      setShowEasterEgg(false);
      setShowGame(false);
    }
  }, []);

  const handleCloseGame = () => {
    setShowGame(false);
  };

  if (showEasterEgg && showGame) {
    return (
      <>
        <Head>
          <title>404 - 비밀 게임 발견!</title>
        </Head>
        <NotFoundPage />
        <TicTacToeGame onClose={handleCloseGame} />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>404 - 페이지를 찾을 수 없습니다</title>
      </Head>
      <NotFoundPage />
    </>
  );
} 