import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ScannerPattern = 'standard' | 'minimal' | 'neon' | 'friendly';
export type SuccessPattern = 'tax' | 'autoDebit';

const VALID_SCANNER_PATTERNS: ScannerPattern[] = ['standard', 'minimal', 'neon', 'friendly'];
const VALID_SUCCESS_PATTERNS: SuccessPattern[] = ['tax', 'autoDebit'];

const isValidScannerPattern = (pattern: unknown): pattern is ScannerPattern =>
  VALID_SCANNER_PATTERNS.includes(pattern as ScannerPattern);

const isValidSuccessPattern = (pattern: unknown): pattern is SuccessPattern =>
  VALID_SUCCESS_PATTERNS.includes(pattern as SuccessPattern);

interface MockState {
  themeColor: string;
  amount: number;
  shopName: string;
  currentView: 'scanner' | 'confirm' | 'success';
  scannerPattern: ScannerPattern;
  successPattern: SuccessPattern;
  setThemeColor: (color: string) => void;
  setAmount: (value: number) => void;
  setShopName: (name: string) => void;
  setCurrentView: (view: 'scanner' | 'confirm' | 'success') => void;
  setScannerPattern: (pattern: ScannerPattern) => void;
  setSuccessPattern: (pattern: SuccessPattern) => void;
}

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_THEME_COLOR = '#ff0033';
const DEFAULT_SCANNER_PATTERN: ScannerPattern = 'standard';
const DEFAULT_SUCCESS_PATTERN: SuccessPattern = 'tax';

export const useMockStore = create<MockState>()(
  persist(
    (set) => ({
      themeColor: DEFAULT_THEME_COLOR,
      amount: 1500,
      shopName: '東京都',
      currentView: 'scanner',
      scannerPattern: DEFAULT_SCANNER_PATTERN,
      successPattern: DEFAULT_SUCCESS_PATTERN,
      setThemeColor: (color) =>
        set({ themeColor: HEX_REGEX.test(color) ? color : DEFAULT_THEME_COLOR }),
      setAmount: (value) =>
        set({ amount: isNaN(value) ? 0 : value }),
      setShopName: (name) => set({ shopName: name }),
      setCurrentView: (view) => set({ currentView: view }),
      setScannerPattern: (pattern) =>
        set({ scannerPattern: isValidScannerPattern(pattern) ? pattern : DEFAULT_SCANNER_PATTERN }),
      setSuccessPattern: (pattern) =>
        set({ successPattern: isValidSuccessPattern(pattern) ? pattern : DEFAULT_SUCCESS_PATTERN }),
    }),
    {
      name: 'phoneqr-store',
      storage: createJSONStorage(() => localStorage),
      // currentView はリロード後にリセットしたいため永続化対象から除外
      partialize: (state) => ({
        themeColor: state.themeColor,
        amount: state.amount,
        shopName: state.shopName,
        scannerPattern: state.scannerPattern,
        successPattern: state.successPattern,
      }),
      // localStorageから復元した各パターンが無効値の場合はデフォルトにフォールバック
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<MockState>;
        return {
          ...currentState,
          ...persisted,
          scannerPattern: isValidScannerPattern(persisted.scannerPattern)
            ? persisted.scannerPattern
            : DEFAULT_SCANNER_PATTERN,
          successPattern: isValidSuccessPattern(persisted.successPattern)
            ? persisted.successPattern
            : DEFAULT_SUCCESS_PATTERN,
        };
      },
    }
  )
);
