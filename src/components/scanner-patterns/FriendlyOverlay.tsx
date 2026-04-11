'use client';

import { motion } from 'framer-motion';
import { Home, QrCode, Clock } from 'lucide-react';

interface OverlayProps {
  themeColor: string;
}

// lighterColorを生成（透明度で近似）
function getLighterColor(themeColor: string): string {
  return themeColor + '99';
}

export default function FriendlyOverlay({ themeColor }: OverlayProps) {
  const lighterColor = getLighterColor(themeColor);

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
          background: `linear-gradient(to right, ${themeColor}, ${lighterColor})`,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '16px',
          paddingRight: '16px',
          pointerEvents: 'auto',
        }}
      >
        <span
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          コード支払い
        </span>
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
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
            position: 'relative',
          }}
        >
          {/* インナーボーダー方式（外側: グラデーション背景） */}
          <div
            data-testid="scan-frame-outer"
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${themeColor}, ${lighterColor})`,
              borderRadius: '24px',
              padding: '3px',
            }}
          >
            {/* 内側: 透明背景 */}
            <div
              style={{
                borderRadius: '21px',
                overflow: 'hidden',
                background: 'transparent',
                width: '100%',
                height: '100%',
              }}
            />
          </div>

          {/* グラデーションウェーブ */}
          <motion.div
            data-testid="gradient-wave"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 60,
              background: `linear-gradient(to bottom, ${themeColor}88, transparent)`,
              borderRadius: '21px 21px 0 0',
              willChange: 'transform',
            }}
            animate={{ y: [-60, 240] }}
            transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
          />
        </div>

        {/* スキャン案内テキスト + インジケータードット */}
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(50% - 170px)',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <p
            style={{
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            QRコードを読み取ります
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </div>
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
            alignItems: 'center',
            justifyContent: 'space-around',
            height: '64px',
            paddingLeft: '32px',
            paddingRight: '32px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Home className="w-5 h-5 text-gray-400" />
            </div>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>ホーム</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div
              data-testid="active-icon-bg"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: themeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: themeColor }}>スキャン</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>履歴</span>
          </div>
        </div>
      </div>

    </div>
  );
}
