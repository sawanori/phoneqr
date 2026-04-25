import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useMockStore } from '@/store/useMockStore';
import { PaymentConfirmView } from '@/components/confirm-views/PaymentConfirmView';

// Zustand store のモック
jest.mock('@/store/useMockStore');

const mockSetCurrentView = jest.fn();
const mockStore = {
  themeColor: '#ff0033',
  amount: 1500,
  shopName: '東京都',
  currentView: 'confirm' as const,
  setCurrentView: mockSetCurrentView,
  setThemeColor: jest.fn(),
  setAmount: jest.fn(),
  setShopName: jest.fn(),
  scannerPattern: 'standard' as const,
  setScannerPattern: jest.fn(),
  successPattern: 'tax' as const,
  setSuccessPattern: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector ? selector(mockStore) : mockStore
  );
});

describe('PaymentConfirmView', () => {
  // CF-01: 金額が正しく表示される
  it('CF-01: 金額が¥1,500形式で表示される', () => {
    render(<PaymentConfirmView />);
    expect(screen.getByText('¥1,500')).toBeInTheDocument();
  });

  // CF-02: 店舗名が正しく表示される
  it('CF-02: 店舗名が「納付先: 東京都」として表示される', () => {
    render(<PaymentConfirmView />);
    expect(screen.getByText('納付先: 東京都')).toBeInTheDocument();
  });

  // CF-06: ボタンクリックでsetCurrentView('success')が呼ばれる
  it('CF-06: ボタンクリックでsetCurrentView("success")が呼ばれる', () => {
    render(<PaymentConfirmView />);
    const button = screen.getByRole('button', { name: '支払う' });
    fireEvent.click(button);
    expect(mockSetCurrentView).toHaveBeenCalledWith('success');
  });

  // CF-10: themeColorがボタンのbackgroundColorに反映される
  it('CF-10: themeColorがボタンのbackgroundColorに反映される', () => {
    render(<PaymentConfirmView />);
    const button = screen.getByRole('button', { name: '支払う' });
    expect(button).toHaveStyle({ backgroundColor: '#ff0033' });
  });
});
