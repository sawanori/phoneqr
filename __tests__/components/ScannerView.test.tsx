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

// scanner-patterns モジュールをモック
jest.mock('@/components/scanner-patterns', () => ({
  StandardOverlay: ({ themeColor }: any) => <div data-testid="standard-overlay">{themeColor}</div>,
  MinimalOverlay: ({ themeColor }: any) => <div data-testid="minimal-overlay">{themeColor}</div>,
  NeonOverlay: ({ themeColor }: any) => <div data-testid="neon-overlay">{themeColor}</div>,
  FriendlyOverlay: ({ themeColor }: any) => <div data-testid="friendly-overlay">{themeColor}</div>,
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
  scannerPattern: 'standard' as const,
  setScannerPattern: jest.fn(),
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

  // V-07: scannerPattern='standard'のときStandardOverlayが表示される
  it('V-07: scannerPattern="standard"のときStandardOverlayが表示される', () => {
    (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector ? selector({ ...mockStore, scannerPattern: 'standard' }) : { ...mockStore, scannerPattern: 'standard' }
    );
    render(<ScannerView />);
    expect(screen.getByTestId('standard-overlay')).toBeInTheDocument();
  });

  // V-08: scannerPattern='minimal'のときMinimalOverlayが表示される
  it('V-08: scannerPattern="minimal"のときMinimalOverlayが表示される', () => {
    (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector ? selector({ ...mockStore, scannerPattern: 'minimal' }) : { ...mockStore, scannerPattern: 'minimal' }
    );
    render(<ScannerView />);
    expect(screen.getByTestId('minimal-overlay')).toBeInTheDocument();
  });

  // V-09: scannerPattern='neon'のときNeonOverlayが表示される
  it('V-09: scannerPattern="neon"のときNeonOverlayが表示される', () => {
    (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector ? selector({ ...mockStore, scannerPattern: 'neon' }) : { ...mockStore, scannerPattern: 'neon' }
    );
    render(<ScannerView />);
    expect(screen.getByTestId('neon-overlay')).toBeInTheDocument();
  });

  // V-10: scannerPattern='friendly'のときFriendlyOverlayが表示される
  it('V-10: scannerPattern="friendly"のときFriendlyOverlayが表示される', () => {
    (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector ? selector({ ...mockStore, scannerPattern: 'friendly' }) : { ...mockStore, scannerPattern: 'friendly' }
    );
    render(<ScannerView />);
    expect(screen.getByTestId('friendly-overlay')).toBeInTheDocument();
  });

  // V-11: どのパターンでもタップでsetCurrentView('success')が呼ばれる
  it('V-11: どのパターンでもタップでsetCurrentView("success")が呼ばれる', () => {
    const patterns = ['standard', 'minimal', 'neon', 'friendly'] as const;
    patterns.forEach((pattern) => {
      jest.clearAllMocks();
      (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector ? selector({ ...mockStore, scannerPattern: pattern }) : { ...mockStore, scannerPattern: pattern }
      );
      const { container } = render(<ScannerView />);
      const wrapper = container.firstChild as HTMLElement;
      fireEvent.click(wrapper);
      expect(mockSetCurrentView).toHaveBeenCalledWith('success');
    });
  });
});
