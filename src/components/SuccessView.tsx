'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMockStore } from '@/store/useMockStore';

const CIRCLE_ANIMATION = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
};

const CHECKMARK_ANIMATION = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: { duration: 0.5, delay: 0.2, ease: 'easeOut' as const },
};

const CHECKMARK_PATH = 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function SuccessView() {
  const themeColor = useMockStore((state) => state.themeColor);
  const amount = useMockStore((state) => state.amount);
  const shopName = useMockStore((state) => state.shopName);
  const setCurrentView = useMockStore((state) => state.setCurrentView);

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const txId = useMemo(() => {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
  }, []);

  const handleContinue = () => {
    setCurrentView('scanner');
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white gap-6 px-6">
      {/* 支払い完了テキスト */}
      <motion.p
        className="text-xl font-semibold text-gray-700"
        {...fadeInUp}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        支払い完了
      </motion.p>

      {/* チェックマークアニメーション */}
      <motion.div
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ backgroundColor: themeColor }}
        {...CIRCLE_ANIMATION}
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-14 h-14"
        >
          <motion.path d={CHECKMARK_PATH} {...CHECKMARK_ANIMATION} />
        </motion.svg>
      </motion.div>

      {/* 金額表示 */}
      <motion.p
        className="text-4xl font-bold text-gray-900 font-amount"
        {...fadeInUp}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        ¥{amount.toLocaleString()}
      </motion.p>

      {/* 店舗名表示 */}
      <motion.p
        className="text-lg text-gray-600"
        {...fadeInUp}
        transition={{ delay: 0.65, duration: 0.4 }}
      >
        支払い先: {shopName}
      </motion.p>

      {/* 区切り線 */}
      <div className="w-full max-w-xs border-t border-gray-200" />

      {/* 日時・取引番号 */}
      <motion.div
        className="flex flex-col items-center gap-1"
        {...fadeInUp}
        transition={{ delay: 0.75, duration: 0.4 }}
      >
        <p className="text-sm text-gray-400">{dateStr}</p>
        <p className="text-sm text-gray-400">取引番号: {txId}</p>
      </motion.div>

      {/* スキャンを続けるボタン */}
      <motion.button
        onClick={handleContinue}
        className="w-full max-w-xs py-4 rounded-2xl text-white font-bold text-lg shadow-lg"
        style={{ backgroundColor: themeColor }}
        {...fadeInUp}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        スキャンを続ける
      </motion.button>
    </div>
  );
}
