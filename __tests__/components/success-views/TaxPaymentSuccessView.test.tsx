import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useMockStore } from '@/store/useMockStore';
import { TaxPaymentSuccessView } from '@/components/success-views/TaxPaymentSuccessView';

// Framer Motionのモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    p: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <p {...rest}>{children}</p>;
    },
    button: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    circle: (props: any) => <circle {...props} />,
    path: (props: any) => <path {...props} />,
  },
}));

// Zustand Storeのモック
jest.mock('@/store/useMockStore');

const mockSetCurrentView = jest.fn();
const defaultMockState = {
  themeColor: '#ff0033',
  amount: 1500,
  shopName: '東京都',
  currentView: 'success' as const,
  successPattern: 'tax' as const,
  scannerPattern: 'standard' as const,
  setCurrentView: mockSetCurrentView,
  setThemeColor: jest.fn(),
  setAmount: jest.fn(),
  setShopName: jest.fn(),
  setScannerPattern: jest.fn(),
  setSuccessPattern: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (useMockStore as unknown as jest.Mock).mockImplementation((selector: any) =>
    selector ? selector(defaultMockState) : defaultMockState
  );
});

describe('TaxPaymentSuccessView', () => {
  describe('TV-01: 金額表示', () => {
    it('amountが¥1,500形式で表示される', () => {
      render(<TaxPaymentSuccessView />);
      expect(screen.getByText('¥1,500')).toBeInTheDocument();
    });
  });

  describe('TV-02: 店舗名表示', () => {
    it('「納付先: {shopName}」が表示される', () => {
      render(<TaxPaymentSuccessView />);
      expect(screen.getByText('納付先: 東京都')).toBeInTheDocument();
    });
  });

  describe('TV-03: スキャンを続けるボタン', () => {
    it('「スキャンを続ける」ボタンタップでsetCurrentView("scanner")が呼ばれる', () => {
      render(<TaxPaymentSuccessView />);
      const button = screen.getByText('スキャンを続ける');
      fireEvent.click(button);
      expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
      expect(mockSetCurrentView).toHaveBeenCalledWith('scanner');
    });
  });

  describe('TV-04: チェックマーク要素', () => {
    it('チェックマーク SVG 要素が存在する', () => {
      render(<TaxPaymentSuccessView />);
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('TV-05: 納税完了テキスト', () => {
    it('「納税完了」テキストが表示される', () => {
      render(<TaxPaymentSuccessView />);
      expect(screen.getByText('納税完了')).toBeInTheDocument();
    });
  });

  describe('TV-06: エッジケース - amount=0', () => {
    it('amountが0のとき¥0と表示される', () => {
      const customState = { ...defaultMockState, amount: 0 };
      (useMockStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector ? selector(customState) : customState
      );
      render(<TaxPaymentSuccessView />);
      expect(screen.getByText('¥0')).toBeInTheDocument();
    });
  });

  describe('TV-07: エッジケース - shopName=""', () => {
    it('shopNameが空文字でも「納付先: 」が表示されクラッシュしない', () => {
      const customState = { ...defaultMockState, shopName: '' };
      (useMockStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector ? selector(customState) : customState
      );
      render(<TaxPaymentSuccessView />);
      expect(screen.getByText(/納付先/)).toBeInTheDocument();
    });
  });
});
