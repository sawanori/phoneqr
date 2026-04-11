'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMockStore } from '@/store/useMockStore';
import type { ScannerPattern } from '@/store/useMockStore';
import { Settings } from 'lucide-react';

const SCANNER_PATTERNS: { id: ScannerPattern; name: string; icon: (color: string) => React.ReactNode }[] = [
  {
    id: 'standard',
    name: 'スタンダード',
    icon: (color) => (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* L字コーナー + 中央横線 */}
        <path d="M4 4h6M4 4v6M28 4h-6M28 4v6M4 28h6M4 28v-6M28 28h-6M28 28v-6" stroke={color} strokeWidth="2" />
        <line x1="6" y1="16" x2="26" y2="16" stroke={color} strokeWidth="1" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'minimal',
    name: 'ミニマル',
    icon: (color) => (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* 角丸の枠のみ */}
        <rect x="6" y="6" width="20" height="20" rx="4" stroke={color} strokeWidth="1" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'neon',
    name: 'ネオン',
    icon: (color) => (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* 正方形 + グロー風 + ティック */}
        <rect x="6" y="6" width="20" height="20" stroke={color} strokeWidth="1" />
        <path d="M6 6h3M6 6v3M26 6h-3M26 6v3M6 26h3M6 26v-3M26 26h-3M26 26v-3" stroke={color} strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'friendly',
    name: 'フレンドリー',
    icon: (color) => (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* 大きな角丸 */}
        <rect x="5" y="5" width="22" height="22" rx="6" stroke={color} strokeWidth="2" />
      </svg>
    ),
  },
];

const PRESET_COLORS = [
  { name: '赤（デフォルト）', hex: '#ff0033' },
  { name: '青', hex: '#0066ff' },
  { name: '緑', hex: '#00cc66' },
  { name: '紫', hex: '#6633cc' },
  { name: 'オレンジ', hex: '#ff6600' },
] as const;

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const themeColor = useMockStore((s) => s.themeColor);
  const amount = useMockStore((s) => s.amount);
  const shopName = useMockStore((s) => s.shopName);
  const scannerPattern = useMockStore((s) => s.scannerPattern);
  const setThemeColor = useMockStore((s) => s.setThemeColor);
  const setAmount = useMockStore((s) => s.setAmount);
  const setShopName = useMockStore((s) => s.setShopName);
  const setScannerPattern = useMockStore((s) => s.setScannerPattern);

  const [hexInput, setHexInput] = useState(themeColor);

  useEffect(() => {
    setHexInput(themeColor);
  }, [themeColor]);

  return (
    <>
      {/* ドロワー本体 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景オーバーレイ */}
            <motion.div
              data-testid="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-40"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            />

            {/* ドロワーパネル */}
            <motion.div
              data-testid="drawer-content"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 w-full rounded-t-3xl bg-white p-6 z-50 flex flex-col gap-4 shadow-2xl max-h-[60dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <Settings size={20} />
                  撮影プロップ設定
                </h3>
                <button
                  onClick={onClose}
                  className="text-blue-500 font-bold"
                >
                  閉じる
                </button>
              </div>

              {/* スキャンUIパターン選択 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  スキャンUIパターン
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SCANNER_PATTERNS.map(({ id, name, icon }) => {
                    const isSelected = scannerPattern === id;
                    return (
                      <button
                        key={id}
                        data-testid={`pattern-${id}`}
                        onClick={() => setScannerPattern(id)}
                        className={`
                          flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                          ${isSelected
                            ? 'border-current ring-2 ring-offset-1'
                            : 'border-gray-200 bg-gray-50'
                          }
                        `}
                        style={isSelected ? { borderColor: themeColor, color: themeColor } : {}}
                      >
                        {/* ミニプレビュー */}
                        <div className="w-full h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                          {icon(themeColor)}
                        </div>
                        <span className={`text-xs font-medium ${isSelected ? '' : 'text-gray-600'}`}>
                          {name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* テーマカラー設定 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  テーマカラー
                </label>

                {/* プリセットカラーボタン */}
                <div className="flex gap-3 mb-3">
                  {PRESET_COLORS.map(({ hex, name }) => {
                    const isSelected = themeColor === hex;
                    return (
                      <button
                        key={hex}
                        data-testid={`preset-color-${hex}`}
                        aria-label={name}
                        onClick={() => {
                          setThemeColor(hex);
                          setHexInput(hex);
                        }}
                        style={{ backgroundColor: hex }}
                        className={[
                          'w-10 h-10 rounded-full border-2 border-transparent',
                          isSelected
                            ? 'ring-2 ring-white ring-offset-2 border-white'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                    );
                  })}
                </div>

                {/* HEXテキスト入力欄 */}
                <input
                  data-testid="theme-color-text-input"
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  onBlur={() => setThemeColor(hexInput)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setThemeColor(hexInput);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="border p-2 rounded w-full text-black"
                  placeholder="#ff0033"
                />
              </div>

              {/* 支払い金額 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  支払い金額 (¥)
                </label>
                <input
                  data-testid="amount-input"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="border p-2 rounded w-full text-black"
                />
              </div>

              {/* 店舗名 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  店舗名
                </label>
                <input
                  data-testid="shop-name-input"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="border p-2 rounded w-full text-black"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
