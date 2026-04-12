'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark } from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const ICON_ANIMATION = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
};

// 口座番号は固定値（C-6対応）
const MASKED_ACCOUNT = '****1234';

export function AutoDebitSuccessView() {
  const themeColor = useMockStore((state) => state.themeColor);
  const amount = useMockStore((state) => state.amount);
  const shopName = useMockStore((state) => state.shopName);
  const setCurrentView = useMockStore((state) => state.setCurrentView);

  const [mounted, setMounted] = useState(false);
  const [debitDate, setDebitDate] = useState<string>('');
  const [txId, setTxId] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 27);
    setDebitDate(
      `${nextMonth.getFullYear()}/${String(nextMonth.getMonth() + 1).padStart(2, '0')}/27`
    );
    setTxId(Math.random().toString(36).slice(2, 10).toUpperCase());
    setMounted(true);
  }, []);

  const handleContinue = () => {
    setCurrentView('scanner');
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white overflow-y-auto gap-6 px-6 py-8">
      {/* アイコン */}
      <motion.div
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ backgroundColor: themeColor }}
        {...ICON_ANIMATION}
      >
        <Landmark className="w-12 h-12 text-white" />
      </motion.div>

      {/* メインテキスト */}
      <motion.p
        className="text-xl font-semibold text-gray-700"
        {...fadeInUp}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        自動引き落とし完了
      </motion.p>

      {/* 金額 */}
      <motion.p
        className="text-4xl font-bold text-gray-900 font-amount"
        {...fadeInUp}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        ¥{amount.toLocaleString()}
      </motion.p>

      {/* サブテキスト */}
      <motion.p
        className="text-lg text-gray-600"
        {...fadeInUp}
        transition={{ delay: 0.65, duration: 0.4 }}
      >
        引き落とし先: {shopName}
      </motion.p>

      {/* 追加情報カード（マウント後のみ表示: Hydration対策） */}
      {mounted && (
        <motion.div
          className="bg-gray-100/50 rounded-2xl p-4 w-full max-w-xs"
          {...fadeInUp}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <ul className="flex flex-col gap-2">
            <li className="flex justify-between text-sm text-gray-600">
              <span>引き落とし予定日</span>
              <span>{debitDate}</span>
            </li>
            <li className="flex justify-between text-sm text-gray-600">
              <span>取引番号:</span>
              <span>{txId}</span>
            </li>
            <li className="flex justify-between text-sm text-gray-600">
              <span>口座番号</span>
              <span>{MASKED_ACCOUNT}</span>
            </li>
          </ul>
        </motion.div>
      )}

      {/* 戻るボタン */}
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

export default AutoDebitSuccessView;
