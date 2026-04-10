'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMockStore } from '@/store/useMockStore';
import { Settings } from 'lucide-react';

const PRESET_COLORS = [
  { name: '赤（デフォルト）', hex: '#ff0033' },
  { name: '青', hex: '#0066ff' },
  { name: '緑', hex: '#00cc66' },
  { name: '紫', hex: '#6633cc' },
  { name: 'オレンジ', hex: '#ff6600' },
] as const;

export default function SettingsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const tapCount = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const themeColor = useMockStore((s) => s.themeColor);
  const amount = useMockStore((s) => s.amount);
  const shopName = useMockStore((s) => s.shopName);
  const setThemeColor = useMockStore((s) => s.setThemeColor);
  const setAmount = useMockStore((s) => s.setAmount);
  const setShopName = useMockStore((s) => s.setShopName);

  const [hexInput, setHexInput] = useState(themeColor);

  useEffect(() => {
    setHexInput(themeColor);
  }, [themeColor]);

  function handleTriggerTap(e: React.MouseEvent) {
    e.stopPropagation();
    tapCount.current += 1;
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsOpen(true);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      {/* 隠しトリガー領域（画面右下） */}
      <button
        data-testid="settings-trigger"
        className="absolute bottom-20 right-4 w-16 h-16 z-50 bg-transparent border-none cursor-pointer"
        onClick={handleTriggerTap}
        aria-label="設定を開く"
      />

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
                setIsOpen(false);
              }}
            />

            {/* ドロワーパネル */}
            <motion.div
              data-testid="drawer-content"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 w-full rounded-t-3xl bg-white p-6 z-50 flex flex-col gap-4 shadow-2xl max-h-[50dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <Settings size={20} />
                  撮影プロップ設定
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-blue-500 font-bold"
                >
                  閉じる
                </button>
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
