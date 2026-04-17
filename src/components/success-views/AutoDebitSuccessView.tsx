'use client';

import { motion } from 'framer-motion';
import { Landmark } from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// アイコンのバウンススケールイン + 回転
const ICON_ANIMATION = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  transition: {
    duration: 0.8,
    ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number], // オーバーシュートのあるbounce
  },
};

// アイコン背景のリング拡散アニメーション
const RING_PULSE = {
  initial: { scale: 0.8, opacity: 0.8 },
  animate: { scale: 2, opacity: 0 },
  transition: {
    duration: 1.4,
    ease: 'easeOut' as const,
    repeat: Infinity,
    repeatDelay: 0.6,
  },
};

export function AutoDebitSuccessView() {
  const themeColor = useMockStore((state) => state.themeColor);
  const amount = useMockStore((state) => state.amount);
  const shopName = useMockStore((state) => state.shopName);
  const setCurrentView = useMockStore((state) => state.setCurrentView);

  const handleReturnToScanner = () => {
    setCurrentView('scanner');
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleReturnToScanner}
      className="w-full min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white overflow-y-auto gap-6 px-6 py-8 cursor-pointer"
    >
      {/* アイコン + 拡散リング */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* 拡散リング（常時アニメ） */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: themeColor }}
          {...RING_PULSE}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: themeColor }}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{
            duration: 1.4,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: 0.6,
            delay: 0.7,
          }}
        />
        {/* メインアイコン */}
        <motion.div
          className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: themeColor }}
          {...ICON_ANIMATION}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
          >
            <Landmark className="w-12 h-12 text-white" />
          </motion.div>
        </motion.div>
      </div>

      {/* メインテキスト */}
      <motion.p
        className="text-xl font-semibold text-gray-700"
        {...fadeInUp}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        自動引き落とし完了
      </motion.p>

      {/* 金額（スケール+フェード） */}
      <motion.p
        className="text-4xl font-bold text-gray-900 font-amount"
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.75, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        ¥{amount.toLocaleString()}
      </motion.p>

      {/* サブテキスト */}
      <motion.p
        className="text-lg text-gray-600"
        {...fadeInUp}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        引き落とし先: {shopName}
      </motion.p>

      {/* タップヒント */}
      <motion.p
        className="text-xs text-gray-400 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.5, 0.8] }}
        transition={{ delay: 1.6, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
      >
        画面をタップして戻る
      </motion.p>
    </div>
  );
}

export default AutoDebitSuccessView;
