/**
 * useMockStore テスト
 * S-01〜S-14 を網羅（正常系・異常系・persist永続化）
 */

// Zustand の store をリセットするため、各テスト前に初期化
beforeEach(() => {
  localStorage.clear();
  jest.resetModules();
});

// ---- ヘルパー: store を動的にインポートして新鮮なインスタンスを取得 ----
async function getStore() {
  const { useMockStore } = await import('../../src/store/useMockStore');
  return useMockStore;
}

// =============================================================================
// 正常系
// =============================================================================

describe('useMockStore - 正常系', () => {
  test('S-01: 初期値が正しく設定されている', async () => {
    const store = await getStore();
    const state = store.getState();

    expect(state.themeColor).toBe('#ff0033');
    expect(state.amount).toBe(1500);
    expect(state.shopName).toBe('東京都');
    expect(state.currentView).toBe('scanner');
  });

  test('S-02: setThemeColor("#00ccff") で themeColor が更新される', async () => {
    const store = await getStore();
    store.getState().setThemeColor('#00ccff');
    expect(store.getState().themeColor).toBe('#00ccff');
  });

  test('S-03: setAmount(3000) で amount が 3000 に更新される', async () => {
    const store = await getStore();
    store.getState().setAmount(3000);
    expect(store.getState().amount).toBe(3000);
  });

  test('S-04: setShopName("Test Shop") で shopName が更新される', async () => {
    const store = await getStore();
    store.getState().setShopName('Test Shop');
    expect(store.getState().shopName).toBe('Test Shop');
  });

  test('S-05: setCurrentView("success") で currentView が "success" に変わる', async () => {
    const store = await getStore();
    store.getState().setCurrentView('success');
    expect(store.getState().currentView).toBe('success');
  });
});

// =============================================================================
// 異常系（バリデーション）
// =============================================================================

describe('useMockStore - 異常系（バリデーション）', () => {
  test('S-06: setThemeColor("invalid") → themeColor がデフォルト #ff0033 にフォールバック', async () => {
    const store = await getStore();
    store.getState().setThemeColor('invalid');
    expect(store.getState().themeColor).toBe('#ff0033');
  });

  test('S-07: setThemeColor("#gggggg") → デフォルト値にフォールバック', async () => {
    const store = await getStore();
    store.getState().setThemeColor('#gggggg');
    expect(store.getState().themeColor).toBe('#ff0033');
  });

  test('S-08: setThemeColor("#fff") (3桁) → デフォルト値にフォールバック', async () => {
    const store = await getStore();
    store.getState().setThemeColor('#fff');
    expect(store.getState().themeColor).toBe('#ff0033');
  });

  test('S-09: setAmount(NaN) → amount が 0 にフォールバック', async () => {
    const store = await getStore();
    store.getState().setAmount(NaN);
    expect(store.getState().amount).toBe(0);
  });

  test('S-10: setAmount(Number("abc")) → amount が 0 にフォールバック', async () => {
    const store = await getStore();
    store.getState().setAmount(Number('abc'));
    expect(store.getState().amount).toBe(0);
  });
});

// =============================================================================
// persist 永続化テスト
// =============================================================================

describe('useMockStore - persist永続化', () => {
  test('S-11: 値変更後、localStorage["phoneqr-store"] に themeColor/amount/shopName が保存される', async () => {
    const store = await getStore();
    store.getState().setThemeColor('#0066ff');
    store.getState().setAmount(2000);
    store.getState().setShopName('My Shop');

    const raw = localStorage.getItem('phoneqr-store');
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.state.themeColor).toBe('#0066ff');
    expect(parsed.state.amount).toBe(2000);
    expect(parsed.state.shopName).toBe('My Shop');
  });

  test('S-12: localStorage に保存済みの値があるとき、store 初期化時に復元される', async () => {
    // 先に localStorage に値を仕込む
    localStorage.setItem(
      'phoneqr-store',
      JSON.stringify({
        state: {
          themeColor: '#6633cc',
          amount: 9999,
          shopName: 'Saved Shop',
        },
        version: 0,
      })
    );

    // モジュールキャッシュをクリアして再インポート
    jest.resetModules();
    const { useMockStore } = await import('../../src/store/useMockStore');

    // persist の rehydration が同期/非同期で行われるため少し待つ
    await new Promise((r) => setTimeout(r, 50));

    const state = useMockStore.getState();
    expect(state.themeColor).toBe('#6633cc');
    expect(state.amount).toBe(9999);
    expect(state.shopName).toBe('Saved Shop');
  });

  test('S-13: currentView は localStorage に保存されない（永続化対象外）', async () => {
    const store = await getStore();
    store.getState().setCurrentView('success');

    const raw = localStorage.getItem('phoneqr-store');
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.state.currentView).toBeUndefined();
  });

  test('S-14: localStorage のデータが破損（不正JSON）の場合、デフォルト値で初期化される', async () => {
    // 破損データを仕込む
    localStorage.setItem('phoneqr-store', 'THIS IS NOT JSON {{{');

    jest.resetModules();
    const { useMockStore } = await import('../../src/store/useMockStore');

    await new Promise((r) => setTimeout(r, 50));

    const state = useMockStore.getState();
    expect(state.themeColor).toBe('#ff0033');
    expect(state.amount).toBe(1500);
    expect(state.shopName).toBe('東京都');
    expect(state.currentView).toBe('scanner');
  });
});

// =============================================================================
// scannerPattern 正常系
// =============================================================================

describe('useMockStore - scannerPattern 正常系', () => {
  test('S-15: 初期値 scannerPattern が "standard" である', async () => {
    const store = await getStore();
    expect(store.getState().scannerPattern).toBe('standard');
  });

  test('S-16: setScannerPattern("minimal") で scannerPattern が "minimal" に更新される', async () => {
    const store = await getStore();
    store.getState().setScannerPattern('minimal');
    expect(store.getState().scannerPattern).toBe('minimal');
  });

  test('S-17: setScannerPattern("neon") で scannerPattern が "neon" に更新される', async () => {
    const store = await getStore();
    store.getState().setScannerPattern('neon');
    expect(store.getState().scannerPattern).toBe('neon');
  });

  test('S-18: setScannerPattern("friendly") で scannerPattern が "friendly" に更新される', async () => {
    const store = await getStore();
    store.getState().setScannerPattern('friendly');
    expect(store.getState().scannerPattern).toBe('friendly');
  });
});

// =============================================================================
// scannerPattern 異常系（バリデーション）
// =============================================================================

describe('useMockStore - scannerPattern 異常系（バリデーション）', () => {
  test('S-19: setScannerPattern("unknown" as any) → scannerPattern が "standard" にフォールバック', async () => {
    const store = await getStore();
    store.getState().setScannerPattern('unknown' as any);
    expect(store.getState().scannerPattern).toBe('standard');
  });

  test('S-20: setScannerPattern("" as any) → "standard" にフォールバック', async () => {
    const store = await getStore();
    store.getState().setScannerPattern('' as any);
    expect(store.getState().scannerPattern).toBe('standard');
  });

  test('S-21: setScannerPattern(null as any) → "standard" にフォールバック', async () => {
    const store = await getStore();
    store.getState().setScannerPattern(null as any);
    expect(store.getState().scannerPattern).toBe('standard');
  });

  test('S-22: setScannerPattern(undefined as any) → "standard" にフォールバック', async () => {
    const store = await getStore();
    store.getState().setScannerPattern(undefined as any);
    expect(store.getState().scannerPattern).toBe('standard');
  });
});

// =============================================================================
// scannerPattern persist 永続化テスト
// =============================================================================

describe('useMockStore - scannerPattern persist永続化', () => {
  test('S-23: scannerPattern が localStorage に保存される（永続化対象）', async () => {
    const store = await getStore();
    store.getState().setScannerPattern('neon');

    const raw = localStorage.getItem('phoneqr-store');
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.state.scannerPattern).toBe('neon');
  });

  test('S-24: localStorage に保存済みの scannerPattern: "neon" がstore初期化時に復元される', async () => {
    localStorage.setItem(
      'phoneqr-store',
      JSON.stringify({
        state: {
          themeColor: '#ff0033',
          amount: 1500,
          shopName: '東京都',
          scannerPattern: 'neon',
        },
        version: 0,
      })
    );

    jest.resetModules();
    const { useMockStore } = await import('../../src/store/useMockStore');

    await new Promise((r) => setTimeout(r, 50));

    const state = useMockStore.getState();
    expect(state.scannerPattern).toBe('neon');
  });

  test('S-25: localStorage の scannerPattern が無効値の場合、"standard" で初期化される', async () => {
    localStorage.setItem(
      'phoneqr-store',
      JSON.stringify({
        state: {
          themeColor: '#ff0033',
          amount: 1500,
          shopName: '東京都',
          scannerPattern: 'invalid-pattern',
        },
        version: 0,
      })
    );

    jest.resetModules();
    const { useMockStore } = await import('../../src/store/useMockStore');

    await new Promise((r) => setTimeout(r, 50));

    const state = useMockStore.getState();
    expect(state.scannerPattern).toBe('standard');
  });
});
