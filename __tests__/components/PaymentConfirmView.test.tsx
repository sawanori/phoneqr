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

  // CF-03: チェックボックスが初期状態で未チェック
  it('CF-03: チェックボックスが初期状態で未チェックである', () => {
    render(<PaymentConfirmView />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  // CF-04: 初期状態で支払いボタンがdisabled
  it('CF-04: 初期状態で支払いボタンがdisabledである', () => {
    render(<PaymentConfirmView />);
    const button = screen.getByRole('button', { name: '支払う' });
    expect(button).toBeDisabled();
  });

  // CF-05: チェックを入れると支払いボタンが有効になる
  it('CF-05: チェックを入れると支払いボタンが有効になる', () => {
    render(<PaymentConfirmView />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    const button = screen.getByRole('button', { name: '支払う' });
    expect(button).not.toBeDisabled();
  });

  // CF-06: チェック済みでボタンクリックするとsetCurrentView('success')が呼ばれる
  it('CF-06: チェック済みでボタンクリックするとsetCurrentView("success")が呼ばれる', () => {
    render(<PaymentConfirmView />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    const button = screen.getByRole('button', { name: '支払う' });
    fireEvent.click(button);
    expect(mockSetCurrentView).toHaveBeenCalledWith('success');
  });

  // CF-07: 未チェック状態でボタンクリックしてもsetCurrentViewが呼ばれない
  it('CF-07: 未チェック状態でボタンクリックしてもsetCurrentViewが呼ばれない', () => {
    render(<PaymentConfirmView />);
    const button = screen.getByRole('button', { name: '支払う' });
    fireEvent.click(button);
    expect(mockSetCurrentView).not.toHaveBeenCalled();
  });

  // CF-08: チェックのON/OFF切り替えでボタンの有効/無効が連動する
  it('CF-08: チェックのON/OFF切り替えでボタンの有効/無効が連動する', () => {
    render(<PaymentConfirmView />);
    const checkbox = screen.getByRole('checkbox');
    const button = screen.getByRole('button', { name: '支払う' });

    // 初期: disabled
    expect(button).toBeDisabled();

    // チェックON: 有効
    fireEvent.click(checkbox);
    expect(button).not.toBeDisabled();

    // チェックOFF: 再度disabled
    fireEvent.click(checkbox);
    expect(button).toBeDisabled();
  });

  // CF-09: "支払い内容を確認しました" テキストが表示される
  it('CF-09: "支払い内容を確認しました" テキストが表示される', () => {
    render(<PaymentConfirmView />);
    expect(screen.getByText('支払い内容を確認しました')).toBeInTheDocument();
  });

  // CF-10: themeColorがボタンのbackgroundColorに反映される
  it('CF-10: themeColorがボタンのbackgroundColorに反映される', () => {
    render(<PaymentConfirmView />);
    const button = screen.getByRole('button', { name: '支払う' });
    expect(button).toHaveStyle({ backgroundColor: '#ff0033' });
  });
});
