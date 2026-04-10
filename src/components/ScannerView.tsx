'use client';

import { motion } from 'framer-motion';
import { Menu, X, Home, QrCode, Clock } from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';
import { useCamera } from '@/hooks/useCamera';
import { playSound } from '@/utils/playSound';

export default function ScannerView() {
  const themeColor = useMockStore((s) => s.themeColor);
  const setCurrentView = useMockStore((s) => s.setCurrentView);
  const { videoRef, error } = useCamera();

  function handleCheatTap() {
    playSound();
    setCurrentView('success');
  }

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden"
      onClick={handleCheatTap}
    >
      {/* カメラ映像 / フォールバック背景 */}
      {error ? (
        <div className="absolute inset-0 bg-[#333333]" />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* ヘッダー帯 */}
      <div
        className="relative z-20 flex items-center justify-between px-4 shadow-md"
        style={{
          backgroundColor: themeColor,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          minHeight: '56px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Menu className="text-white w-6 h-6" />
        <span className="text-white font-bold text-base">コード支払い</span>
        <X className="text-white w-6 h-6" />
      </div>

      {/* スキャンマスク（中央240×240px を透明にくり抜き） */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: 240,
            height: 240,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            position: 'relative',
          }}
        >
          {/* QR読み取り枠：四隅のL字ボーダー */}
          {/* 左上 */}
          <div
            className="absolute top-0 left-0"
            style={{
              width: 32,
              height: 32,
              borderTop: `4px solid ${themeColor}`,
              borderLeft: `4px solid ${themeColor}`,
            }}
          />
          {/* 右上 */}
          <div
            className="absolute top-0 right-0"
            style={{
              width: 32,
              height: 32,
              borderTop: `4px solid ${themeColor}`,
              borderRight: `4px solid ${themeColor}`,
            }}
          />
          {/* 左下 */}
          <div
            className="absolute bottom-0 left-0"
            style={{
              width: 32,
              height: 32,
              borderBottom: `4px solid ${themeColor}`,
              borderLeft: `4px solid ${themeColor}`,
            }}
          />
          {/* 右下 */}
          <div
            className="absolute bottom-0 right-0"
            style={{
              width: 32,
              height: 32,
              borderBottom: `4px solid ${themeColor}`,
              borderRight: `4px solid ${themeColor}`,
            }}
          />

          {/* スキャンライン */}
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: themeColor,
              boxShadow: `0 0 16px 4px ${themeColor}`,
              opacity: 0.9,
            }}
            animate={{ y: [0, 236] }}
            transition={{
              duration: 1.8,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </div>

        {/* スキャン案内テキスト */}
        <p
          className="absolute text-white text-sm text-center"
          style={{ top: 'calc(50% + 140px)' }}
        >
          QRコードを枠内に収めてください
        </p>
      </div>

      {/* ボトムナビゲーションバー */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-16 px-8">
          <div className="flex flex-col items-center justify-center gap-0.5">
            <Home className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] text-gray-400">ホーム</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5">
            <QrCode className="w-6 h-6" style={{ color: themeColor }} />
            <span className="text-[10px] font-bold" style={{ color: themeColor }}>スキャン</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] text-gray-400">履歴</span>
          </div>
        </div>
      </div>
    </div>
  );
}
