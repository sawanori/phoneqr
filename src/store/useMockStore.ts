import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MockState {
  themeColor: string;
  amount: number;
  shopName: string;
  currentView: 'scanner' | 'success';
  setThemeColor: (color: string) => void;
  setAmount: (value: number) => void;
  setShopName: (name: string) => void;
  setCurrentView: (view: 'scanner' | 'success') => void;
}

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_THEME_COLOR = '#ff0033';

export const useMockStore = create<MockState>()(
  persist(
    (set) => ({
      themeColor: DEFAULT_THEME_COLOR,
      amount: 1500,
      shopName: '東京都',
      currentView: 'scanner',
      setThemeColor: (color) =>
        set({ themeColor: HEX_REGEX.test(color) ? color : DEFAULT_THEME_COLOR }),
      setAmount: (value) =>
        set({ amount: isNaN(value) ? 0 : value }),
      setShopName: (name) => set({ shopName: name }),
      setCurrentView: (view) => set({ currentView: view }),
    }),
    {
      name: 'phoneqr-store',
      storage: createJSONStorage(() => localStorage),
      // currentView はリロード後にリセットしたいため永続化対象から除外
      partialize: (state) => ({
        themeColor: state.themeColor,
        amount: state.amount,
        shopName: state.shopName,
      }),
    }
  )
);
