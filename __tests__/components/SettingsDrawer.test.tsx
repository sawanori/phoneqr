import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

const defaultMockState = {
  themeColor: '#ff0033',
  amount: 1500,
  shopName: '東京都',
  currentView: 'scanner' as const,
  setCurrentView: jest.fn(),
  setThemeColor: mockSetThemeColor,
  setAmount: mockSetAmount,
  setShopName: mockSetShopName,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  (useMockStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector ? selector(defaultMockState) : defaultMockState
  );
});

afterEach(() => {
  jest.useRealTimers();
});

// トリガー領域を取得するヘルパー
function getTriggerArea() {
  // data-testid="settings-trigger" を使う
  return screen.getByTestId('settings-trigger');
}

describe('SettingsDrawer', () => {
  // ---- 正常系 ----

  it('D-01: 3回タップでドロワーが表示される', () => {
    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    // ドロワーはまだ表示されていない
    expect(screen.queryByText('撮影プロップ設定')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

    expect(screen.getByText('撮影プロップ設定')).toBeInTheDocument();
  });

  it('D-02: 2回タップ後1秒経過でカウントリセット、その後1回タップしてもドロワーが開かない', () => {
    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    fireEvent.click(trigger);
    fireEvent.click(trigger);

    // 1秒経過
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // 1回タップ → 合計1回なのでドロワーは開かない
    fireEvent.click(trigger);
    expect(screen.queryByText('撮影プロップ設定')).not.toBeInTheDocument();
  });

  it('D-03: themeColorテキスト入力でblur時にsetThemeColorが呼ばれる', () => {
    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    // ドロワーを開く
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

    const hexInput = screen.getByTestId('theme-color-text-input');
    // onChange時はStoreを更新しない（ローカルstateのみ更新）
    fireEvent.change(hexInput, { target: { value: '#0066ff' } });
    expect(mockSetThemeColor).not.toHaveBeenCalled();

    // onBlur時にsetThemeColorが呼ばれる
    fireEvent.blur(hexInput);
    expect(mockSetThemeColor).toHaveBeenCalledWith('#0066ff');
  });

  it('D-04: amount入力変更でsetAmountが呼ばれる', () => {
    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

    const amountInput = screen.getByTestId('amount-input');
    fireEvent.change(amountInput, { target: { value: '3000' } });

    expect(mockSetAmount).toHaveBeenCalledWith(3000);
  });

  it('D-05: shopName入力変更でsetShopNameが呼ばれる', () => {
    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

    const shopNameInput = screen.getByTestId('shop-name-input');
    fireEvent.change(shopNameInput, { target: { value: 'Test Shop' } });

    expect(mockSetShopName).toHaveBeenCalledWith('Test Shop');
  });

  it('D-06: オーバーレイクリックでドロワーが閉じる', () => {
    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    // ドロワーを開く
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

    expect(screen.getByText('撮影プロップ設定')).toBeInTheDocument();

    // オーバーレイをクリック
    const overlay = screen.getByTestId('drawer-overlay');
    fireEvent.click(overlay);

    expect(screen.queryByText('撮影プロップ設定')).not.toBeInTheDocument();
  });

  // ---- タイマーリーク/連続タップ（C-3対応） ----

  it('D-07: 1回タップ→0.5秒後に2回目→さらに0.5秒後に3回目→ドロワーが開く（1秒以内の3タップ成功）', () => {
    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    fireEvent.click(trigger);
    act(() => { jest.advanceTimersByTime(500); });
    fireEvent.click(trigger);
    act(() => { jest.advanceTimersByTime(500); });
    fireEvent.click(trigger);

    expect(screen.getByText('撮影プロップ設定')).toBeInTheDocument();
  });

  it('D-08: トリガータップがe.stopPropagation()で親に伝播しないこと', () => {
    const parentClickHandler = jest.fn();

    render(
      <div onClick={parentClickHandler}>
        <SettingsDrawer />
      </div>
    );

    const trigger = getTriggerArea();
    fireEvent.click(trigger);

    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('D-09: ドロワー内クリックが親に伝播しないこと', () => {
    const parentClickHandler = jest.fn();

    render(
      <div onClick={parentClickHandler}>
        <SettingsDrawer />
      </div>
    );

    const trigger = getTriggerArea();
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

    // ドロワーが開いた状態でドロワー内をクリック
    parentClickHandler.mockClear();
    const drawerContent = screen.getByTestId('drawer-content');
    fireEvent.click(drawerContent);

    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  // ---- カラー同期テスト（I-7対応） ----

  it('D-10: プリセットカラーボタン（青）をクリックするとsetThemeColor("#0066ff")が呼ばれる', () => {
    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

    const bluePreset = screen.getByTestId('preset-color-#0066ff');
    fireEvent.click(bluePreset);

    expect(mockSetThemeColor).toHaveBeenCalledWith('#0066ff');
  });

  it('D-11: 現在のthemeColorと一致するプリセットがハイライトされている', () => {
    // themeColorが '#ff0033'（赤）の場合
    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

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

    render(<SettingsDrawer />);
    const trigger = getTriggerArea();

    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

    const presetColors = ['#ff0033', '#0066ff', '#00cc66', '#6633cc', '#ff6600'];
    for (const hex of presetColors) {
      const preset = screen.getByTestId(`preset-color-${hex}`);
      expect(preset.className).not.toMatch(/ring-2/);
    }
  });
});
