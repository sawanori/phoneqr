import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useMockStore } from '@/store/useMockStore';
import SettingsDrawer from '@/components/SettingsDrawer';

// Zustand store のモック
jest.mock('@/store/useMockStore');

// Framer Motion のモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockSetThemeColor = jest.fn();
const mockSetAmount = jest.fn();
const mockSetShopName = jest.fn();
const mockSetScannerPattern = jest.fn();

const defaultMockState = {
  themeColor: '#ff0033',
  amount: 1500,
  shopName: '東京都',
  currentView: 'scanner' as const,
  setCurrentView: jest.fn(),
  setThemeColor: mockSetThemeColor,
  setAmount: mockSetAmount,
  setShopName: mockSetShopName,
  scannerPattern: 'standard' as const,
  setScannerPattern: mockSetScannerPattern,
};

beforeEach(() => {
  jest.clearAllMocks();
  (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector ? selector(defaultMockState) : defaultMockState
  );
});

// ドロワーを開いた状態でレンダリングするヘルパー
function renderOpen(onClose = jest.fn()) {
  return render(<SettingsDrawer isOpen={true} onClose={onClose} />);
}

describe('SettingsDrawer', () => {
  // ---- 正常系 ----

  it('D-03: themeColorテキスト入力でblur時にsetThemeColorが呼ばれる', () => {
    renderOpen();

    const hexInput = screen.getByTestId('theme-color-text-input');
    // onChange時はStoreを更新しない（ローカルstateのみ更新）
    fireEvent.change(hexInput, { target: { value: '#0066ff' } });
    expect(mockSetThemeColor).not.toHaveBeenCalled();

    // onBlur時にsetThemeColorが呼ばれる
    fireEvent.blur(hexInput);
    expect(mockSetThemeColor).toHaveBeenCalledWith('#0066ff');
  });

  it('D-04: amount入力変更でsetAmountが呼ばれる', () => {
    renderOpen();

    const amountInput = screen.getByTestId('amount-input');
    fireEvent.change(amountInput, { target: { value: '3000' } });

    expect(mockSetAmount).toHaveBeenCalledWith(3000);
  });

  it('D-05: shopName入力変更でsetShopNameが呼ばれる', () => {
    renderOpen();

    const shopNameInput = screen.getByTestId('shop-name-input');
    fireEvent.change(shopNameInput, { target: { value: 'Test Shop' } });

    expect(mockSetShopName).toHaveBeenCalledWith('Test Shop');
  });

  it('D-06: オーバーレイクリックでonCloseが呼ばれる', () => {
    const mockOnClose = jest.fn();
    renderOpen(mockOnClose);

    expect(screen.getByText('撮影プロップ設定')).toBeInTheDocument();

    // オーバーレイをクリック
    const overlay = screen.getByTestId('drawer-overlay');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('D-06b: 閉じるボタンクリックでonCloseが呼ばれる', () => {
    const mockOnClose = jest.fn();
    renderOpen(mockOnClose);

    fireEvent.click(screen.getByText('閉じる'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('D-09: ドロワー内クリックが親に伝播しないこと', () => {
    const parentClickHandler = jest.fn();

    render(
      <div onClick={parentClickHandler}>
        <SettingsDrawer isOpen={true} onClose={jest.fn()} />
      </div>
    );

    // ドロワーが開いた状態でドロワー内をクリック
    parentClickHandler.mockClear();
    const drawerContent = screen.getByTestId('drawer-content');
    fireEvent.click(drawerContent);

    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('D-closed: isOpen=falseのときドロワーが表示されない', () => {
    render(<SettingsDrawer isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByText('撮影プロップ設定')).not.toBeInTheDocument();
  });

  it('D-open: isOpen=trueのときドロワーが表示される', () => {
    renderOpen();
    expect(screen.getByText('撮影プロップ設定')).toBeInTheDocument();
  });

  // ---- カラー同期テスト（I-7対応） ----

  it('D-10: プリセットカラーボタン（青）をクリックするとsetThemeColor("#0066ff")が呼ばれる', () => {
    renderOpen();

    const bluePreset = screen.getByTestId('preset-color-#0066ff');
    fireEvent.click(bluePreset);

    expect(mockSetThemeColor).toHaveBeenCalledWith('#0066ff');
  });

  it('D-11: 現在のthemeColorと一致するプリセットがハイライトされている', () => {
    // themeColorが '#ff0033'（赤）の場合
    renderOpen();

    const redPreset = screen.getByTestId('preset-color-#ff0033');
    // ハイライトクラス（ring-2）が付いていること
    expect(redPreset.className).toMatch(/ring/);
  });

  it('D-12: プリセットに存在しないHEX値の場合、どのプリセットもハイライトされない', () => {
    // themeColorをプリセットにない値に設定
    const customState = {
      ...defaultMockState,
      themeColor: '#123456',
    };
    (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector ? selector(customState) : customState
    );

    renderOpen();

    const presetColors = ['#ff0033', '#0066ff', '#00cc66', '#6633cc', '#ff6600'];
    for (const hex of presetColors) {
      const preset = screen.getByTestId(`preset-color-${hex}`);
      expect(preset.className).not.toMatch(/ring-2/);
    }
  });

  // ---- スキャンUIパターン選択 ----

  it('D-14: ドロワー内に「スキャンUIパターン」セクションが存在する', () => {
    renderOpen();
    expect(screen.getByText('スキャンUIパターン')).toBeInTheDocument();
  });

  it('D-15: パターン選択ボタンが4つ存在する（standard/minimal/neon/friendly）', () => {
    renderOpen();

    expect(screen.getByTestId('pattern-standard')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-minimal')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-neon')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-friendly')).toBeInTheDocument();
  });

  it('D-16: scannerPatternが"standard"のとき、pattern-standardボタンがthemeColorのborderColorを持つ', () => {
    renderOpen();

    const standardBtn = screen.getByTestId('pattern-standard');
    expect(standardBtn).toHaveStyle({ borderColor: '#ff0033' });
  });

  it('D-17: pattern-minimalボタンクリックでsetScannerPattern("minimal")が呼ばれる', () => {
    renderOpen();

    fireEvent.click(screen.getByTestId('pattern-minimal'));
    expect(mockSetScannerPattern).toHaveBeenCalledWith('minimal');
  });

  it('D-18: pattern-neonボタンクリックでsetScannerPattern("neon")が呼ばれる', () => {
    renderOpen();

    fireEvent.click(screen.getByTestId('pattern-neon'));
    expect(mockSetScannerPattern).toHaveBeenCalledWith('neon');
  });

  it('D-19: pattern-friendlyボタンクリックでsetScannerPattern("friendly")が呼ばれる', () => {
    renderOpen();

    fireEvent.click(screen.getByTestId('pattern-friendly'));
    expect(mockSetScannerPattern).toHaveBeenCalledWith('friendly');
  });
});
