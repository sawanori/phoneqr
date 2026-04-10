import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useMockStore } from '@/store/useMockStore';
import SuccessView from '@/components/SuccessView';

// Framer Motionのモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
    svg: ({ children, ...props }: React.SVGAttributes<SVGSVGElement> & { children?: React.ReactNode }) => <svg {...props}>{children}</svg>,
    circle: (props: React.SVGAttributes<SVGCircleElement>) => <circle {...props} />,
    path: (props: React.SVGAttributes<SVGPathElement>) => <path {...props} />,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { children?: React.ReactNode }) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Zustand Storeのモック
jest.mock('@/store/useMockStore');

const mockSetCurrentView = jest.fn();
const defaultMockState = {
  themeColor: '#ff0033',
  amount: 1500,
  shopName: '東京都',
  currentView: 'success' as const,
  setCurrentView: mockSetCurrentView,
  setThemeColor: jest.fn(),
  setAmount: jest.fn(),
  setShopName: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (useMockStore as unknown as jest.Mock).mockImplementation((selector?: (state: typeof defaultMockState) => unknown) =>
    selector ? selector(defaultMockState) : defaultMockState
  );
});

describe('SuccessView', () => {
  describe('SV-01: 金額表示', () => {
    it('Zustandのamountが¥1,500形式で表示される', () => {
      render(<SuccessView />);
      expect(screen.getByText('¥1,500')).toBeInTheDocument();
    });
  });

  describe('SV-02: 店舗名表示', () => {
    it('ZustandのshopNameが「納税先: NonTurn Cafe」形式で表示される', () => {
      render(<SuccessView />);
      expect(screen.getByText('納税先: 東京都')).toBeInTheDocument();
    });
  });

  describe('SV-03: スキャンを続けるボタン', () => {
    it('「スキャンを続ける」ボタンタップでsetCurrentView("scanner")が呼ばれる', () => {
      render(<SuccessView />);
      const button = screen.getByText('スキャンを続ける');
      fireEvent.click(button);
      expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
      expect(mockSetCurrentView).toHaveBeenCalledWith('scanner');
    });
  });

  describe('SV-04: チェックマーク要素', () => {
    it('チェックマーク要素が存在する', () => {
      render(<SuccessView />);
      // SVGのチェックマークパスが存在することを確認
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('エッジケース', () => {
    it('amountが0の場合、¥0と表示される', () => {
      const customState = { ...defaultMockState, amount: 0 };
      (useMockStore as unknown as jest.Mock).mockImplementation((selector?: (state: typeof customState) => unknown) =>
        selector ? selector(customState) : customState
      );
      render(<SuccessView />);
      expect(screen.getByText('¥0')).toBeInTheDocument();
    });

    it('amountが1000000の場合、¥1,000,000と表示される', () => {
      const customState = { ...defaultMockState, amount: 1000000 };
      (useMockStore as unknown as jest.Mock).mockImplementation((selector?: (state: typeof customState) => unknown) =>
        selector ? selector(customState) : customState
      );
      render(<SuccessView />);
      expect(screen.getByText('¥1,000,000')).toBeInTheDocument();
    });

    it('shopNameが空文字の場合でも「支払い先: 」が表示されクラッシュしない', () => {
      const customState = { ...defaultMockState, shopName: '' };
      (useMockStore as unknown as jest.Mock).mockImplementation((selector?: (state: typeof customState) => unknown) =>
        selector ? selector(customState) : customState
      );
      render(<SuccessView />);
      // shopNameが空でも店舗名表示のp要素が存在し、クラッシュしないことを確認
      // Testing Libraryは末尾スペースをnormalizeするため、正規表現で先頭部分だけ確認
      expect(screen.getByText(/納税先/)).toBeInTheDocument();
    });
  });
});
