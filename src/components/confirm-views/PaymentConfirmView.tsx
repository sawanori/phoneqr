'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMockStore } from '@/store/useMockStore';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function PaymentConfirmView() {
  const themeColor = useMockStore((s) => s.themeColor);
  const amount = useMockStore((s) => s.amount);
  const shopName = useMockStore((s) => s.shopName);
  const setCurrentView = useMockStore((s) => s.setCurrentView);

  const [checked, setChecked] = useState(false);

  const handlePay = () => {
    if (checked) {
      setCurrentView('success');
    }
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white gap-6 px-6">
      {/* 金額表示 */}
      <motion.p
        className="text-4xl font-bold text-gray-900 font-amount"
        {...fadeInUp}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        ¥{amount.toLocaleString()}
      </motion.p>

      {/* 店舗名表示 */}
      <motion.p
        className="text-lg text-gray-600"
        {...fadeInUp}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        支払い先: {shopName}
      </motion.p>

      {/* 区切り線 */}
      <motion.div
        className="w-full max-w-xs border-t border-gray-200"
        {...fadeInUp}
        transition={{ delay: 0.3, duration: 0.4 }}
      />

      {/* チェックボックス */}
      <motion.label
        className="flex items-center gap-3 cursor-pointer select-none"
        {...fadeInUp}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {/* ネイティブinputは非表示 */}
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        {/* カスタムチェックボックス */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200"
          style={
            checked
              ? { backgroundColor: themeColor, borderWidth: 0 }
              : { backgroundColor: 'transparent', borderWidth: 2, borderStyle: 'solid', borderColor: '#d1d5db' }
          }
        >
          {checked && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-base text-gray-700">支払い内容を確認しました</span>
      </motion.label>

      {/* 支払うボタン */}
      <motion.button
        onClick={handlePay}
        disabled={!checked}
        className={[
          'w-full max-w-xs py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-opacity duration-200',
          !checked ? 'opacity-40 cursor-not-allowed' : '',
        ].join(' ')}
        style={{ backgroundColor: themeColor }}
        {...fadeInUp}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        支払う
      </motion.button>
    </div>
  );
}

export default PaymentConfirmView;
