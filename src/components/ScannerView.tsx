'use client';
import { useMockStore, type ScannerPattern } from '@/store/useMockStore';
import { useCamera } from '@/hooks/useCamera';
import { playSound } from '@/utils/playSound';
import {
  StandardOverlay,
  MinimalOverlay,
  NeonOverlay,
  FriendlyOverlay,
} from './scanner-patterns';
import SettingsDrawer from './SettingsDrawer';
import type { ComponentType } from 'react';

interface OverlayProps {
  themeColor: string;
}

const PATTERN_MAP: Record<ScannerPattern, ComponentType<OverlayProps>> = {
  standard: StandardOverlay,
  minimal: MinimalOverlay,
  neon: NeonOverlay,
  friendly: FriendlyOverlay,
};

export default function ScannerView() {
  const themeColor = useMockStore((s) => s.themeColor);
  const setCurrentView = useMockStore((s) => s.setCurrentView);
  const scannerPattern = useMockStore((s) => s.scannerPattern);
  const { videoRef, error } = useCamera();

  const handleCheatTap = () => {
    playSound();
    setCurrentView('success');
  };

  const OverlayComponent = PATTERN_MAP[scannerPattern] ?? StandardOverlay;

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden"
      onClick={handleCheatTap}
    >
      {/* カメラ映像 / フォールバック */}
      {error ? (
        <div className="absolute inset-0 bg-[#333333]" />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* パターン別オーバーレイ */}
      <OverlayComponent themeColor={themeColor} />

      {/* 設定ドロワー（チートタップのstopPropagationが効くよう子要素に配置） */}
      <SettingsDrawer />
    </div>
  );
}
