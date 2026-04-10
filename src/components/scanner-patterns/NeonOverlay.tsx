'use client';

import { motion } from 'framer-motion';
import { Home, QrCode, Clock } from 'lucide-react';

interface OverlayProps {
  themeColor: string;
}

// themeColorからRGB値を抽出するヘルパー
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const fullHex =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(fullHex.substring(0, 2), 16) || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) || 0;
  return { r, g, b };
}

export default function NeonOverlay({ themeColor }: OverlayProps) {
  const { r, g, b } = hexToRgb(themeColor);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      {/* 上部ガード領域 */}
      <div style={{ height: 20, touchAction: 'none' }} />

      {/* ヘッダー帯 */}
      <div
        data-testid="header"
        style={{
          backgroundColor: '#0a0a0a',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '16px',
          paddingRight: '16px',
          pointerEvents: 'auto',
        }}
      >
        <span style={{ color: themeColor, fontFamily: "'Courier New', monospace", fontSize: '12px' }}>
          [
        </span>
        <span
          style={{
            color: themeColor,
            fontFamily: "'Courier New', monospace",
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          SCAN_QR.EXE
        </span>
        <span style={{ color: themeColor, fontFamily: "'Courier New', monospace", fontSize: '12px' }}>
          ]
        </span>
      </div>

      {/* 左上偽ステータス */}
      <div
        style={{
          position: 'absolute',
          top: '76px',
          left: '16px',
          color: themeColor,
          fontFamily: "'Courier New', monospace",
          fontSize: '9px',
          opacity: 0.6,
        }}
      >
        RES: 4K / MODE: QR
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
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
            position: 'relative',
          }}
        >
          {/* ネオン枠（固定box-shadow - アニメーションしない） */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: `1px solid ${themeColor}`,
              boxShadow: `0 0 12px 2px ${themeColor}, inset 0 0 12px 2px rgba(${r},${g},${b},0.15)`,
            }}
          />

          {/* 回転アニメーション用ブラッシュライン（CSSアニメーション） */}
          <div
            data-testid="rotate-ring"
            style={{
              position: 'absolute',
              inset: -8,
              border: `1px dashed ${themeColor}`,
              opacity: 0.4,
              animation: 'neon-rotate 4s linear infinite',
            }}
          />

          {/* 四隅ターゲットマーカー */}
          {/* 左上 */}
          <div
            data-testid="corner-marker-tl"
            style={{
              position: 'absolute',
              top: -2,
              left: -2,
              width: 20,
              height: 20,
              borderTop: `2px solid ${themeColor}`,
              borderLeft: `2px solid ${themeColor}`,
            }}
          />
          {/* 右上 */}
          <div
            data-testid="corner-marker-tr"
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 20,
              height: 20,
              borderTop: `2px solid ${themeColor}`,
              borderRight: `2px solid ${themeColor}`,
            }}
          />
          {/* 左下 */}
          <div
            data-testid="corner-marker-bl"
            style={{
              position: 'absolute',
              bottom: -2,
              left: -2,
              width: 20,
              height: 20,
              borderBottom: `2px solid ${themeColor}`,
              borderLeft: `2px solid ${themeColor}`,
            }}
          />
          {/* 右下 */}
          <div
            data-testid="corner-marker-br"
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 20,
              height: 20,
              borderBottom: `2px solid ${themeColor}`,
              borderRight: `2px solid ${themeColor}`,
            }}
          />

          {/* スキャンライン（下から上への一方向） */}
          <motion.div
            data-testid="scan-line"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: themeColor,
              opacity: 0.8,
              willChange: 'transform',
            }}
            animate={{ y: [236, 0] }}
            transition={{
              duration: 1.2,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        </div>

        {/* スキャン案内テキスト */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 'calc(50% - 160px)',
            left: 0,
            right: 0,
            color: themeColor,
            fontSize: '12px',
            textAlign: 'center',
            fontFamily: "'Courier New', monospace",
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        >
          {'> SCANNING...'}
        </motion.div>
      </div>

      {/* ボトムナビゲーションバー */}
      <div
        style={{
          backgroundColor: '#0a0a0a',
          borderTop: `1px solid ${themeColor}33`,
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
            <Home className="w-5 h-5" style={{ color: '#555' }} />
            <span style={{ fontSize: '10px', color: '#555' }}>ホーム</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <QrCode
              className="w-6 h-6"
              style={{
                color: themeColor,
                filter: `drop-shadow(0 0 4px ${themeColor})`,
              }}
            />
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: themeColor }}>スキャン</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <Clock className="w-5 h-5" style={{ color: '#555' }} />
            <span style={{ fontSize: '10px', color: '#555' }}>履歴</span>
          </div>
        </div>
      </div>

      {/* 下部ガード領域 */}
      <div style={{ height: 20, touchAction: 'none' }} />

      {/* CSS keyframesのためのstyleタグ */}
      <style>{`
        @keyframes neon-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-testid="rotate-ring"] {
            animation-play-state: paused;
          }
        }
      `}</style>
    </div>
  );
}
