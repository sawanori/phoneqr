'use client';

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

  const handlePay = () => {
    setCurrentView('success');
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white gap-6 px-6">
      {/* 金額表示（上下に横線で強調） */}
      <motion.div
        className="w-full max-w-xs flex flex-col items-center gap-3"
        {...fadeInUp}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="w-full h-[2px]" style={{ backgroundColor: themeColor }} />
        <p className="text-4xl font-bold text-gray-900 font-amount">
          ¥{amount.toLocaleString()}
        </p>
        <div className="w-full h-[2px]" style={{ backgroundColor: themeColor }} />
      </motion.div>

      {/* 店舗名表示 */}
      <motion.p
        className="text-lg text-gray-600"
        {...fadeInUp}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        納付先: {shopName}
      </motion.p>

      {/* 支払うボタン */}
      <motion.button
        onClick={handlePay}
        className="w-full max-w-xs py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-opacity duration-200"
        style={{ backgroundColor: themeColor }}
        {...fadeInUp}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        支払う
      </motion.button>
    </div>
  );
}

export default PaymentConfirmView;
