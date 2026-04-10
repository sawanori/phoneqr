import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ScannerPattern = 'standard' | 'minimal' | 'neon' | 'friendly';

const VALID_PATTERNS: ScannerPattern[] = ['standard', 'minimal', 'neon', 'friendly'];

const isValidPattern = (pattern: unknown): pattern is ScannerPattern =>
  VALID_PATTERNS.includes(pattern as ScannerPattern);

interface MockState {
  themeColor: string;
  amount: number;
  shopName: string;
  currentView: 'scanner' | 'success';
  scannerPattern: ScannerPattern;
  setThemeColor: (color: string) => void;
  setAmount: (value: number) => void;
  setShopName: (name: string) => void;
  setCurrentView: (view: 'scanner' | 'success') => void;
  setScannerPattern: (pattern: ScannerPattern) => void;
}

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_THEME_COLOR = '#ff0033';
const DEFAULT_SCANNER_PATTERN: ScannerPattern = 'standard';

export const useMockStore = create<MockState>()(
  persist(
    (set) => ({
      themeColor: DEFAULT_THEME_COLOR,
      amount: 1500,
      shopName: '東京都',
      currentView: 'scanner',
      scannerPattern: DEFAULT_SCANNER_PATTERN,
      setThemeColor: (color) =>
        set({ themeColor: HEX_REGEX.test(color) ? color : DEFAULT_THEME_COLOR }),
      setAmount: (value) =>
        set({ amount: isNaN(value) ? 0 : value }),
      setShopName: (name) => set({ shopName: name }),
      setCurrentView: (view) => set({ currentView: view }),
      setScannerPattern: (pattern) =>
        set({ scannerPattern: isValidPattern(pattern) ? pattern : DEFAULT_SCANNER_PATTERN }),
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
      }),
      // localStorageから復元した scannerPattern が無効値の場合はデフォルトにフォールバック
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<MockState>;
        return {
          ...currentState,
          ...persisted,
          scannerPattern: isValidPattern(persisted.scannerPattern)
            ? persisted.scannerPattern
            : DEFAULT_SCANNER_PATTERN,
        };
      },
    }
  )
);
