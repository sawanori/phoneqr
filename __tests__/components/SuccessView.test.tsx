/**
 * SuccessView ラッパーテスト - successPattern による切り替えのみ検証
 */
jest.mock('@/components/success-views/TaxPaymentSuccessView', () => ({
  TaxPaymentSuccessView: () => <div data-testid="tax-payment-view" />,
}));
jest.mock('@/components/success-views/AutoDebitSuccessView', () => ({
  AutoDebitSuccessView: () => <div data-testid="auto-debit-view" />,
}));

import { render, screen } from '@testing-library/react';
import SuccessView from '@/components/SuccessView';
import { useMockStore } from '@/store/useMockStore';

jest.mock('@/store/useMockStore');

describe('SuccessView ラッパー', () => {
  const createMockState = (successPattern: 'tax' | 'autoDebit' | string) => ({
    themeColor: '#ff0033',
    amount: 1500,
    shopName: '東京都',
    currentView: 'success' as const,
    successPattern,
    scannerPattern: 'standard' as const,
    setCurrentView: jest.fn(),
    setThemeColor: jest.fn(),
    setAmount: jest.fn(),
    setShopName: jest.fn(),
    setScannerPattern: jest.fn(),
    setSuccessPattern: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SV-W-01: successPattern === "tax" のとき TaxPaymentSuccessView が描画される', () => {
    const state = createMockState('tax');
    (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector ? selector(state) : state
    );
    render(<SuccessView />);
    expect(screen.getByTestId('tax-payment-view')).toBeInTheDocument();
    expect(screen.queryByTestId('auto-debit-view')).not.toBeInTheDocument();
  });

  it('SV-W-02: successPattern === "autoDebit" のとき AutoDebitSuccessView が描画される', () => {
    const state = createMockState('autoDebit');
    (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector ? selector(state) : state
    );
    render(<SuccessView />);
    expect(screen.getByTestId('auto-debit-view')).toBeInTheDocument();
    expect(screen.queryByTestId('tax-payment-view')).not.toBeInTheDocument();
  });

  it('SV-W-03: 無効な successPattern 値でも TaxPaymentSuccessView がフォールバックで描画される', () => {
    const state = createMockState('invalid' as any);
    (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector ? selector(state) : state
    );
    render(<SuccessView />);
    expect(screen.getByTestId('tax-payment-view')).toBeInTheDocument();
  });
});
