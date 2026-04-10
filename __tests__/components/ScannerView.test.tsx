import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useMockStore } from '@/store/useMockStore';
import { playSound } from '@/utils/playSound';
import { useCamera } from '@/hooks/useCamera';
import ScannerView from '@/components/ScannerView';

// Zustand store のモック
jest.mock('@/store/useMockStore');

// playSound のモック
jest.mock('@/utils/playSound', () => ({
  playSound: jest.fn(),
}));

// useCamera のモック
jest.mock('@/hooks/useCamera', () => ({
  useCamera: jest.fn(),
}));

// Framer Motion のモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
}));

const mockSetCurrentView = jest.fn();
const mockStore = {
  themeColor: '#ff0033',
  amount: 1500,
  shopName: '東京都',
  currentView: 'scanner' as const,
  setCurrentView: mockSetCurrentView,
  setThemeColor: jest.fn(),
  setAmount: jest.fn(),
  setShopName: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector ? selector(mockStore) : mockStore
  );

  // デフォルト: カメラ成功ケース
  (useCamera as jest.Mock).mockReturnValue({
    videoRef: { current: document.createElement('video') },
    error: null,
  });
});

describe('ScannerView', () => {
  // V-01: 画面をタップするとsetCurrentView('success')が呼ばれる
  it('V-01: 画面をタップするとsetCurrentView("success")が呼ばれる', () => {
    const { container } = render(<ScannerView />);
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.click(wrapper);
    expect(mockSetCurrentView).toHaveBeenCalledWith('success');
  });

  // V-02: タップ前にplaySound()が呼ばれる（C-2対応）
  it('V-02: タップ時にplaySound()が呼ばれる', () => {
    const { container } = render(<ScannerView />);
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.click(wrapper);
    expect(playSound).toHaveBeenCalled();
    // playsoundはsetCurrentViewより前に呼ばれる
    const playSoundCallOrder = (playSound as jest.Mock).mock.invocationCallOrder[0];
    const setCurrentViewCallOrder = mockSetCurrentView.mock.invocationCallOrder[0];
    expect(playSoundCallOrder).toBeLessThan(setCurrentViewCallOrder);
  });

  // V-03: カメラエラー時にダークグレー背景が表示される
  it('V-03: カメラエラー時にダークグレー背景が表示される', () => {
    (useCamera as jest.Mock).mockReturnValue({
      videoRef: { current: null },
      error: 'Camera access denied',
    });

    const { container } = render(<ScannerView />);
    // ダークグレー背景要素が存在するか確認
    const darkBg = container.querySelector('[style*="333333"], .bg-\\[\\#333333\\]');
    expect(darkBg).not.toBeNull();
  });

  // V-04: カメラエラー時もタップでsetCurrentView('success')が呼ばれる
  it('V-04: カメラエラー時もタップでsetCurrentView("success")が呼ばれる', () => {
    (useCamera as jest.Mock).mockReturnValue({
      videoRef: { current: null },
      error: 'Camera access denied',
    });

    const { container } = render(<ScannerView />);
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.click(wrapper);
    expect(mockSetCurrentView).toHaveBeenCalledWith('success');
  });

  // V-05: ヘッダーにthemeColorが適用されている
  it('V-05: ヘッダーにthemeColorが適用されている', () => {
    const { container } = render(<ScannerView />);
    // ヘッダー要素にthemeColorのinline styleが適用されているか
    const header = container.querySelector('[style*="ff0033"]');
    expect(header).not.toBeNull();
  });

  // V-06: ボトムナビゲーションバーが存在する
  it('V-06: ボトムナビゲーションバーが存在する', () => {
    const { container } = render(<ScannerView />);
    // h-16クラスのボトムナビが存在するか
    const bottomNav = container.querySelector('.h-16');
    expect(bottomNav).not.toBeNull();
  });
});
