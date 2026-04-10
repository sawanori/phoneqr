'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useMockStore } from '@/store/useMockStore';

const ScannerView = dynamic(() => import('@/components/ScannerView'), { ssr: false });
const SuccessView = dynamic(() => import('@/components/SuccessView'), { ssr: false });
const SettingsDrawer = dynamic(() => import('@/components/SettingsDrawer'), { ssr: false });

export default function Home() {
  const currentView = useMockStore((s) => s.currentView);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {currentView === 'scanner' ? (
          <motion.div
            key="scanner"
            className="relative w-full h-full"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ScannerView />
            <SettingsDrawer />
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className="relative w-full h-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SuccessView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
