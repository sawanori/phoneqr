'use client';

import { motion } from 'framer-motion';
import { Home, QrCode, Clock, Menu, X } from 'lucide-react';

interface OverlayProps {
  themeColor: string;
  onOpenSettings: () => void;
}

export default function StandardOverlay({ themeColor, onOpenSettings }: OverlayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ヘッダー帯 */}
      <div
        data-testid="header"
        style={{
          backgroundColor: themeColor,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          minHeight: '56px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '16px',
          paddingRight: '16px',
          pointerEvents: 'auto',
        }}
      >
        <Menu className="text-white w-6 h-6" />
        <span className="text-white font-bold text-base">コード支払い</span>
        <X className="text-white w-6 h-6" />
      </div>

      {/* スキャンマスク（中央240×240px を透明にくり抜き） */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
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
            data-testid="corner-tl"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 32,
              height: 32,
              borderTop: `4px solid ${themeColor}`,
              borderLeft: `4px solid ${themeColor}`,
            }}
          />
          {/* 右上 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 32,
              height: 32,
              borderTop: `4px solid ${themeColor}`,
              borderRight: `4px solid ${themeColor}`,
            }}
          />
          {/* 左下 */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 32,
              height: 32,
              borderBottom: `4px solid ${themeColor}`,
              borderLeft: `4px solid ${themeColor}`,
            }}
          />
          {/* 右下 */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 32,
              height: 32,
              borderBottom: `4px solid ${themeColor}`,
              borderRight: `4px solid ${themeColor}`,
            }}
          />

          {/* スキャンライン */}
          <motion.div
            data-testid="scan-line"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: themeColor,
              opacity: 0.9,
              willChange: 'transform',
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
          style={{
            position: 'absolute',
            bottom: 'calc(50% - 160px)',
            left: 0,
            right: 0,
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          QRコードを枠内に収めてください
        </p>
      </div>

      {/* ボトムナビゲーションバー */}
      <div
        style={{
          backgroundColor: 'white',
          borderTop: '1px solid #f3f4f6',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: '64px',
            paddingBottom: '8px',
            paddingLeft: '32px',
            paddingRight: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <Home className="w-5 h-5 text-gray-400" />
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>ホーム</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <QrCode className="w-6 h-6" style={{ color: themeColor }} />
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: themeColor }}>スキャン</span>
          </div>
          <div
            data-testid="history-button"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
          >
            <Clock className="w-5 h-5 text-gray-400" />
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>履歴</span>
          </div>
        </div>
      </div>

    </div>
  );
}
