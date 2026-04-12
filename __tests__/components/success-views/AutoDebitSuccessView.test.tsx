import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useMockStore } from '@/store/useMockStore';
import { AutoDebitSuccessView } from '@/components/success-views/AutoDebitSuccessView';

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
    li: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <li {...rest}>{children}</li>;
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
  successPattern: 'autoDebit' as const,
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

describe('AutoDebitSuccessView', () => {
  // 正常系
  describe('AD-01: 自動引き落とし完了テキスト', () => {
    it('「自動引き落とし完了」テキストが表示される', async () => {
      render(<AutoDebitSuccessView />);
      expect(screen.getByText('自動引き落とし完了')).toBeInTheDocument();
    });
  });

  describe('AD-02: 引き落とし先表示', () => {
    it('「引き落とし先: 東京都」が表示される', async () => {
      render(<AutoDebitSuccessView />);
      expect(screen.getByText('引き落とし先: 東京都')).toBeInTheDocument();
    });
  });

  describe('AD-03: 金額表示', () => {
    it('¥1,500が表示される', async () => {
      render(<AutoDebitSuccessView />);
      expect(screen.getByText('¥1,500')).toBeInTheDocument();
    });
  });

  describe('AD-04: Landmarkアイコン', () => {
    it('svg要素が描画される（Landmarkアイコンの存在確認）', async () => {
      render(<AutoDebitSuccessView />);
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('AD-05: アイコン背景色', () => {
    it('アイコン円背景にthemeColorが適用される', async () => {
      render(<AutoDebitSuccessView />);
      // themeColorがstyle属性として適用されているdivを確認
      const coloredDivs = document.querySelectorAll('[style]');
      const hasThemeColor = Array.from(coloredDivs).some(
        (el) => (el as HTMLElement).style.backgroundColor === 'rgb(255, 0, 51)' ||
                 (el as HTMLElement).getAttribute('style')?.includes('#ff0033')
      );
      expect(hasThemeColor).toBe(true);
    });
  });

  // 引き落とし予定日（fakeTimers使用: C-7対応）
  describe('AD-06: 引き落とし予定日 - 通常月', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-04-10T12:00:00').getTime());
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('2026-04-10設定 → 「2026/05/27」が表示される', async () => {
      render(<AutoDebitSuccessView />);
      await act(async () => {
        jest.runAllTimers();
      });
      await waitFor(() => {
        expect(screen.getByText('2026/05/27')).toBeInTheDocument();
      });
    });
  });

  describe('AD-07: 引き落とし予定日 - 12月跨ぎ', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-12-15T12:00:00').getTime());
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('2026-12-15設定 → 「2027/01/27」が表示される', async () => {
      render(<AutoDebitSuccessView />);
      await act(async () => {
        jest.runAllTimers();
      });
      await waitFor(() => {
        expect(screen.getByText('2027/01/27')).toBeInTheDocument();
      });
    });
  });

  describe('AD-08: 引き落とし予定日 - 月末', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-31T12:00:00').getTime());
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('2026-01-31設定 → 「2026/02/27」が表示される', async () => {
      render(<AutoDebitSuccessView />);
      await act(async () => {
        jest.runAllTimers();
      });
      await waitFor(() => {
        expect(screen.getByText('2026/02/27')).toBeInTheDocument();
      });
    });
  });

  // ダミー情報
  describe('AD-09: 取引番号', () => {
    it('「取引番号:」ラベルと8桁英数字の値が表示される', async () => {
      render(<AutoDebitSuccessView />);
      await waitFor(() => {
        // 「取引番号:」ラベルが存在することを確認
        const labelElement = screen.getByText(/取引番号/);
        expect(labelElement).toBeInTheDocument();

        // 取引番号の値（8桁英数字）が存在することを確認
        // liの親要素のtextContentを結合して確認
        const liElement = labelElement.closest('li');
        expect(liElement).not.toBeNull();
        const liText = liElement?.textContent || '';
        const match = liText.match(/[A-Z0-9]{8}/);
        expect(match).not.toBeNull();
      });
    });
  });

  describe('AD-10: 口座番号', () => {
    it('口座番号が****1234と固定値で表示される', async () => {
      render(<AutoDebitSuccessView />);
      await waitFor(() => {
        expect(screen.getByText('****1234')).toBeInTheDocument();
      });
    });
  });

  // インタラクション
  describe('AD-11: 画面タップで戻る', () => {
    it('画面のどこをタップしてもsetCurrentView("scanner")が呼ばれる', async () => {
      render(<AutoDebitSuccessView />);
      // ルート要素（role="button"）をクリック
      const rootButton = screen.getByRole('button');
      fireEvent.click(rootButton);
      expect(mockSetCurrentView).toHaveBeenCalledWith('scanner');
    });

    it('「スキャンを続ける」ボタンが存在しない', async () => {
      render(<AutoDebitSuccessView />);
      expect(screen.queryByText('スキャンを続ける')).not.toBeInTheDocument();
    });
  });

  describe('AD-12: 背景グラデーション', () => {
    it('背景グラデーションクラス from-gray-50 が含まれる', async () => {
      render(<AutoDebitSuccessView />);
      const rootDiv = document.querySelector('.from-gray-50');
      expect(rootDiv).toBeInTheDocument();
    });
  });

  // エッジケース
  describe('AD-13: エッジケース - amount=0', () => {
    it('amountが0のとき¥0と表示される', async () => {
      const customState = { ...defaultMockState, amount: 0 };
      (useMockStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector ? selector(customState) : customState
      );
      render(<AutoDebitSuccessView />);
      expect(screen.getByText('¥0')).toBeInTheDocument();
    });
  });

  describe('AD-14: エッジケース - shopName=""', () => {
    it('shopNameが空文字でも「引き落とし先: 」が表示されクラッシュしない', async () => {
      const customState = { ...defaultMockState, shopName: '' };
      (useMockStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector ? selector(customState) : customState
      );
      render(<AutoDebitSuccessView />);
      expect(screen.getByText(/引き落とし先/)).toBeInTheDocument();
    });
  });
});
