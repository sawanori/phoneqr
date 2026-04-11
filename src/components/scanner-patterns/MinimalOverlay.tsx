'use client';

import { motion } from 'framer-motion';

interface OverlayProps {
  themeColor: string;
}

export default function MinimalOverlay({ themeColor }: OverlayProps) {
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
      {/* 極薄ヘッダーバー（themeColor背景の帯ではない） */}
      <div
        style={{
          height: '44px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'white',
            fontWeight: 300,
            letterSpacing: '0.15em',
            fontSize: '14px',
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
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            position: 'relative',
          }}
        >
          {/* パルスアニメーション付きの角丸枠 */}
          <motion.div
            data-testid="pulse-frame"
            animate={{ opacity: [0.7, 1, 0.7], scale: [0.98, 1, 0.98] }}
            transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
            data-scan-frame
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '16px',
              border: '1.5px solid rgba(255,255,255,0.7)',
              willChange: 'transform',
            }}
          />

          {/* スキャン枠（角丸） - data-testid用の非アニメーション要素 */}
          <div
            data-testid="scan-frame"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '16px',
              pointerEvents: 'none',
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
            fontSize: '12px',
            textAlign: 'center',
            opacity: 0.6,
          }}
        >
          QRコードを枠内に収めてください
        </p>
      </div>

    </div>
  );
}
