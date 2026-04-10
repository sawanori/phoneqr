# 更新版実装計画書 — 撮影用QR決済モックアプリ（PWA）

> 作成日: 2026-04-10  
> ベース: PRD.md  
> 反映済みレビュー: CRITICAL C-1〜C-6 / INFORMATIONAL I-1〜I-11

---

## 1. アーキテクチャ変更点のサマリ

### I-10: ページ遷移 → コンポーネント切替方式（重要変更）

PRD §5-C では `app/success/page.tsx` への `router.push` によるページ遷移を定義していたが、
本計画書では **同一ページ内でのコンポーネント切替方式** に変更する。

**変更理由**
- `router.push` は非同期処理であり、タップから画面切替まで数十〜数百msの遅延が生じる。
  撮影現場でのNG削減という目的において、この遅延はリスクになる。
- Zustand state `currentView` を用いた条件レンダリングにより **0ms即時切替** を実現する。

**変更内容**
| 項目 | PRD（変更前） | 本計画書（変更後） |
|------|-------------|----------------|
| 決済完了表示 | `app/success/page.tsx` へ router.push | `src/components/SuccessView.tsx` をその場でレンダリング |
| スキャン画面 | `app/page.tsx` に直接記述 | `src/components/ScannerView.tsx` として分離 |
| ルーティング | Next.js App Router 利用 | `page.tsx` から dynamic import で切替 |
| Zustand state追加 | なし | `currentView: 'scanner' \| 'success'` を追加 |

---

## 2. ファイル構成（ディレクトリツリー）

```
phoneqr/
├── app/
│   ├── globals.css                  # overscroll-behavior, touch-action, 100dvh等
│   ├── layout.tsx                   # viewport meta, apple-touch-icon, manifest link
│   ├── manifest.ts                  # Next.js方式（manifest.json ではなく manifest.ts）
│   └── page.tsx                     # dynamic(import, {ssr: false}) でScannerView/SuccessViewを切替
├── src/
│   ├── components/
│   │   ├── ScannerView.tsx          # スキャン画面UI（カメラ、オーバーレイ、チート機能）
│   │   ├── SuccessView.tsx          # 決済完了画面UI（アニメーション、金額・店舗名表示）
│   │   └── SettingsDrawer.tsx       # 隠し設定ドロワー（3タップトリガー、タイマーcleanup付き）
│   ├── hooks/
│   │   └── useCamera.ts             # カメラ制御（track.stop() cleanup付き）
│   ├── store/
│   │   └── useMockStore.ts          # persist + HEXバリデーション + NaNガード付き
│   └── utils/
│       └── playSound.ts             # 効果音再生ユーティリティ
├── public/
│   ├── sounds/
│   │   └── success.mp3              # 効果音ファイル（ダミー可）
│   └── icons/
│       ├── icon-180.png             # apple-touch-icon用（180×180px）
│       ├── icon-192.png             # PWA manifest用
│       └── icon-512.png             # PWA manifest用
└── __tests__/
    ├── store/
    │   └── useMockStore.test.ts
    ├── components/
    │   ├── ScannerView.test.tsx
    │   ├── SuccessView.test.tsx
    │   └── SettingsDrawer.test.tsx
    └── hooks/
        └── useCamera.test.ts
```

> **注**: PRD §7.2 は効果音パスを `/public/success.mp3` と記載しているが、  
> 本計画書では `/public/sounds/success.mp3` に統一する（C-6対応）。

---

## 3. 機能一覧と詳細仕様

### 3-1. Zustand Store (`src/store/useMockStore.ts`)

#### 管理状態

| フィールド | 型 | デフォルト値 | 説明 |
|-----------|---|-------------|------|
| `themeColor` | `string` | `#ff0033` | アプリテーマカラー（HEX6桁） |
| `amount` | `number` | `1500` | 支払い金額 |
| `shopName` | `string` | `'NonTurn Cafe'` | 店舗名 |
| `currentView` | `'scanner' \| 'success'` | `'scanner'` | 現在の表示ビュー（I-10対応） |

#### setter仕様（バリデーション付き）

- **`setThemeColor(color: string)`**  
  - バリデーション: `/^#[0-9a-fA-F]{6}$/` に一致しない場合はデフォルト値 `#ff0033` にフォールバック（C-4対応）
  - 一致する場合のみ state を更新する

- **`setAmount(value: number)`**  
  - バリデーション: `isNaN(value)` の場合はデフォルト値 `0` にフォールバック（I-3対応）
  - 正常値の場合のみ state を更新する

- **`setShopName(name: string)`**  
  - バリデーションなし（任意の文字列を許容）

- **`setCurrentView(view: 'scanner' | 'success')`**  
  - view を切り替える

#### persist設定（C-1対応）

```typescript
persist(
  (set) => ({ ... }),
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
```

#### SSR Hydration Mismatch対策（I-9対応）

- `page.tsx` で `dynamic(import(...), { ssr: false })` を使用し、persist hydrationによるSSR/CSR不一致を防ぐ。

---

### 3-2. ScannerView (`src/components/ScannerView.tsx`)

#### カメラ映像

- `useCamera` フックで取得したストリームを `<video>` タグの `srcObject` にバインド
- `object-cover` で全画面表示、絶対配置で最背面に配置
- カメラエラー時: ダークグレー背景 (`#333333`) を表示し、UIオーバーレイとタップ遷移は継続動作（PRD §7.4）

#### UIオーバーレイ

**ヘッダー帯（I-2対応）**
- 高さ: `h-14`（56px）
- 背景色: `themeColor`
- テキスト: 「コード支払い」（中央配置、白文字）
- アイコン: 左端にメニューアイコン（Lucide `Menu`）、右端に `X` アイコン
- z-index: オーバーレイより前面

**スキャンマスク**
- 画面全体に半透明黒マスク（`rgba(0,0,0,0.6)`）
- 中央 240×240px の正方形のみ透明にくり抜き（`mix-blend-mode` または SVG clipPath を使用）

**QR読み取り枠**
- 四隅に `themeColor` のL字ボーダー（太さ: 4px、長さ: 32px）
- 枠サイズ: 240×240px

**スキャンライン（レーザー）**
- Framer Motion `animate` で枠内を上下往復
- `duration: 1.8s`、`easing: easeInOut`、`repeat: Infinity`、`repeatType: 'reverse'`（I-6対応）
- 色: `themeColor`（半透明グラデーション）、高さ2px

**ボトムナビゲーションバー（I-2対応）**
- 高さ: `h-16`（64px）
- 背景色: 白 or ダークグレー（テーマによらず固定）
- アイコン: `Home`、`QrCode`（中央、`themeColor` でハイライト）、`Clock`（履歴）の3アイコン
- タップしても何も起きない（モック用途）

#### チート機能（現場用）

- 画面内のどこをタップしても `setCurrentView('success')` を即時呼び出す
- ただし設定ドロワーのトリガー領域（右下 64×64px）はタップ伝播を止める（C-2対応: 遷移前に `playSound()` を呼び出す）

---

### 3-3. useCamera (`src/hooks/useCamera.ts`)

```
返り値: { videoRef: RefObject<HTMLVideoElement>, error: string | null }
```

- `useEffect` 内で `getUserMedia({ video: { facingMode: 'environment' } })` を呼び出す
- 取得したストリームを `videoRef.current.srcObject` にセット
- クリーンアップ関数で `stream.getTracks().forEach(track => track.stop())` を必ず実行（C-5対応）
- エラーは `error` state に格納し、コンポーネント側でフォールバックUIを切替

---

### 3-4. playSound (`src/utils/playSound.ts`)

```typescript
export function playSound(): void {
  const audio = new Audio('/sounds/success.mp3');
  audio.play().catch(console.warn);  // C-2: .catch(() => {}) → .catch(console.warn)
}
```

- パス: `/sounds/success.mp3`（C-6対応: `/public/sounds/success.mp3` と統一）
- `handleCheatTap` 内で `playSound()` を呼び出し、その後に `setCurrentView('success')` を実行（C-2対応）

---

### 3-5. SettingsDrawer (`src/components/SettingsDrawer.tsx`)

#### トリガー領域（I-1対応）

- 右下固定の透明ボタン: `w-16 h-16`（64×64px）
- タップを3回、1秒以内にカウントするトリガーロジック

#### タイマーリーク修正（C-3対応）

```typescript
const tapCount = useRef(0);
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

function handleTriggerTap() {
  tapCount.current += 1;
  if (tapCount.current >= 3) {
    tapCount.current = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
    return;
  }
  if (timerRef.current) clearTimeout(timerRef.current);  // 既存タイマーをクリア
  timerRef.current = setTimeout(() => {
    tapCount.current = 0;
  }, 1000);
}

useEffect(() => {
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);  // cleanup
  };
}, []);
```

#### カラー設定UI（I-11対応）

PRD §5-B では `input type="color"` の利用を定義していたが、**モバイルブラウザでの挙動が不安定**なため、
プリセットカラーボタン方式に変更し、HEXテキスト入力は併用する。

**プリセットカラー一覧**

| 名前 | HEX値 |
|------|-------|
| 赤（デフォルト） | `#ff0033` |
| 青 | `#0066ff` |
| 緑 | `#00cc66` |
| 紫 | `#6633cc` |
| オレンジ | `#ff6600` |

- 各プリセットは丸型のカラースウォッチボタンとして表示
- 選択中のプリセットは枠線でハイライト
- HEXテキスト入力との同期: テキスト入力変更時に `setThemeColor` を呼び出し（バリデーション付き）、逆にプリセット選択時もテキスト入力欄の値を更新

#### その他設定項目

- `amount`: `<input type="number">` — 変更時に `setAmount(Number(e.target.value))`
- `shopName`: `<input type="text">` — 変更時に `setShopName(e.target.value)`

#### ドロワーUI

- Framer Motion でスライドイン（`y: '100%' → 0`）、`duration: 0.3s`、`easing: easeOut`（I-6対応）
- 高さ: 画面の 50% (`h-[50dvh]`)
- 背景クリックで閉じる（オーバーレイ付き）

---

### 3-6. SuccessView (`src/components/SuccessView.tsx`)

#### UI

- 背景: 白
- 中央: `themeColor` の円形背景 + Framer Motionで描画されるチェックマーク（SVGパス描画 + スケールイン）
  - スケールイン: `scale: 0 → 1`、`duration: 0.4s`、`easing: easeOut`（I-6対応）
  - パス描画: `pathLength: 0 → 1`、`duration: 0.5s`、`delay: 0.2s`
- 金額: Zustandの `amount` を `¥X,XXX` 形式で大きく表示（`text-4xl font-bold`）
- 店舗名: `支払い先: {shopName}`（`text-lg text-gray-600`）
- 下部ボタン: 「スキャンを続ける」→ `setCurrentView('scanner')` を呼び出す

---

### 3-7. layout.tsx / globals.css

#### layout.tsx

- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />`
- `<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />` （I-8対応）
- `<link rel="manifest" href="/manifest.webmanifest" />`

#### globals.css

```css
html, body {
  height: 100dvh;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: pan-y;
}
```

---

### 3-8. manifest.ts（I-5対応）

PRD §3 では `manifest.json` を想定しているが、Next.js App Router では **`app/manifest.ts`** による
`MetadataRoute.Manifest` 型の返却が推奨されるため、本計画書では `manifest.ts` 方式を採用する。

```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QR決済モック',
    short_name: 'QR Pay',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff0033',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

---

## 4. テストケースリスト

### 4-0. getUserMediaモック戦略（I-4対応）

テストセットアップ（`jest.setup.ts` または各テストファイルの `beforeEach`）で以下を定義する。

```typescript
// 成功ケース用モック
const mockTrack = { stop: jest.fn() };
const mockStream = { getTracks: jest.fn(() => [mockTrack]) };

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue(mockStream),
  },
});

// 失敗ケース用モック（個別テスト内で上書き）
(navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(
  new Error('Permission denied')
);
```

---

### 4-1. useMockStore テスト (`__tests__/store/useMockStore.test.ts`)

#### 正常系
| # | テストケース |
|---|------------|
| S-01 | 初期値が正しく設定されている（themeColor, amount, shopName, currentView） |
| S-02 | `setThemeColor('#00ccff')` で themeColor が更新される |
| S-03 | `setAmount(3000)` で amount が 3000 に更新される |
| S-04 | `setShopName('Test Shop')` で shopName が更新される |
| S-05 | `setCurrentView('success')` で currentView が 'success' に変わる |

#### 異常系（バリデーション）
| # | テストケース |
|---|------------|
| S-06 | `setThemeColor('invalid')` → themeColor がデフォルト `#ff0033` にフォールバック（C-4） |
| S-07 | `setThemeColor('#gggggg')` → デフォルト値にフォールバック（C-4） |
| S-08 | `setThemeColor('#fff')` (3桁) → デフォルト値にフォールバック（C-4） |
| S-09 | `setAmount(NaN)` → amount が `0` にフォールバック（I-3） |
| S-10 | `setAmount(Number('abc'))` → amount が `0` にフォールバック（I-3） |

#### persist永続化テスト（C-1対応）
| # | テストケース |
|---|------------|
| S-11 | storeの値変更後、localStorage['phoneqr-store'] に themeColor/amount/shopName が保存される |
| S-12 | localStorage に保存済みの値があるとき、store初期化時に復元される |
| S-13 | `currentView` は localStorage に保存されない（永続化対象外） |
| S-14 | localStorage のデータが破損（不正JSON）の場合、デフォルト値で初期化される |

---

### 4-2. useCamera テスト (`__tests__/hooks/useCamera.test.ts`)

| # | テストケース |
|---|------------|
| C-01 | マウント時に `getUserMedia` が `facingMode: 'environment'` で呼ばれる |
| C-02 | ストリーム取得成功時、videoRef.current.srcObject にストリームがセットされる |
| C-03 | エラー発生時、`error` state に エラーメッセージが格納される（PRD §7.4） |
| C-04 | **アンマウント時に `track.stop()` が呼ばれる**（C-5対応） |
| C-05 | アンマウント時、`getUserMedia` が pending の場合もストリーム取得後に `stop()` が呼ばれる |

---

### 4-3. ScannerView テスト (`__tests__/components/ScannerView.test.tsx`)

| # | テストケース |
|---|------------|
| V-01 | 画面をタップすると `setCurrentView('success')` が呼ばれる |
| V-02 | タップ前に `playSound()` が呼ばれる（C-2対応） |
| V-03 | カメラエラー時にダークグレー背景が表示される（PRD §7.4） |
| V-04 | カメラエラー時もタップで `setCurrentView('success')` が呼ばれる |
| V-05 | ヘッダーに themeColor が適用されている |
| V-06 | スキャン枠の四隅ボーダーに themeColor が適用されている |

---

### 4-4. SuccessView テスト (`__tests__/components/SuccessView.test.tsx`)

| # | テストケース |
|---|------------|
| SV-01 | Zustandの `amount` が `¥1,500` 形式で表示される |
| SV-02 | Zustandの `shopName` が `支払い先: NonTurn Cafe` 形式で表示される |
| SV-03 | 「スキャンを続ける」ボタンタップで `setCurrentView('scanner')` が呼ばれる |
| SV-04 | チェックマーク要素が存在する（Framer Motionアニメーション有無に依らず） |

---

### 4-5. SettingsDrawer テスト (`__tests__/components/SettingsDrawer.test.tsx`)

#### 正常系
| # | テストケース |
|---|------------|
| D-01 | 3回タップで isOpen が true になる |
| D-02 | 2回タップ後1秒経過でカウントリセット、その後1回タップしてもドロワーが開かない |
| D-03 | themeColorテキスト入力変更で store の themeColor が更新される |
| D-04 | amountテキスト入力変更で store の amount が更新される |
| D-05 | shopNameテキスト入力変更で store の shopName が更新される |
| D-06 | オーバーレイクリックで isOpen が false になる |

#### タイマーリーク/連続タップ挙動テスト（C-3対応）
| # | テストケース |
|---|------------|
| D-07 | 1回タップ → 0.5秒後に2回目タップ → さらに1秒待機 → カウントリセット（タイマーが上書きされる） |
| D-08 | コンポーネントアンマウント時に clearTimeout が呼ばれる |
| D-09 | 連続3タップ後すぐにまた1タップしてもドロワーが二重に開かない |

#### カラーピッカー↔テキスト入力同期テスト（I-7対応）
| # | テストケース |
|---|------------|
| D-10 | プリセットカラーボタン（青）をクリックするとHEXテキスト入力欄が `#0066ff` に更新される |
| D-11 | HEXテキスト入力欄に `#00cc66` を入力するとプリセット（緑）がハイライトされる |
| D-12 | HEXテキスト入力に無効値（`invalid`）を入力すると store は更新されない / デフォルト値のまま |
| D-13 | HEXテキスト入力に無効値を入力後、有効値（`#0066ff`）を入力すると store が更新される |

---

## 5. エラー＆レスキューマップ

| 処理 | 想定される異常 | ハンドリング方法 | ユーザーへの影響 |
|------|--------------|----------------|---------------|
| `getUserMedia` 呼び出し | カメラ権限拒否 / デバイス非対応 | catch で `error` state にメッセージ格納 | ダークグレー背景表示。タップ遷移は継続動作（PRD §7.4） |
| カメラストリーム取得後 | コンポーネントアンマウント（ページ離脱等） | `useEffect` cleanup で `track.stop()` を呼び出す（C-5） | カメラリソースが適切に解放される |
| `Audio.play()` 呼び出し | Autoplay Policyによる再生拒否 / ファイル未配置 | `.catch(console.warn)` で警告ログ出力（C-2） | 効果音なしで遷移は正常に続行。現場での撮影継続可能 |
| `setThemeColor` 呼び出し | 無効HEX値（入力ミス等） | バリデーションで弾き、デフォルト `#ff0033` にフォールバック（C-4） | UI崩れなし。不正値は無視される |
| `setAmount` 呼び出し | NaN（空入力→Number変換等） | `isNaN` チェックで弾き、`0` にフォールバック（I-3） | 金額が `¥0` で表示される。安全に継続 |
| localStorage read/write | プライベートブラウジング / ストレージ満杯 | Zustand persistの内部try-catchに委ねる | 状態の永続化が無効化されるが、アプリは動作継続 |
| localStorage データ破損 | 不正JSONや想定外の型 | Zustand persistのdeserializeエラーでデフォルト値を使用 | リロード後に設定がリセットされる |
| タップカウントタイマー | アンマウント後のsetState呼び出し | `useEffect` cleanup で `clearTimeout`（C-3） | メモリリークなし。コンソールエラーなし |

---

## 6. 並列開発用チーム構成

### Phase 0: 環境構築（全チーム共通の前提）

**担当**: Foundation Team  
**内容**:
- Next.js (App Router, TypeScript, Tailwind CSS) 環境を `create-next-app` で構築
- パッケージインストール: `framer-motion`、`zustand`、`lucide-react`
- テスト環境セットアップ: `jest`、`@testing-library/react`、`@testing-library/jest-dom`
- `jest.setup.ts` に `getUserMedia` モック（I-4対応コード）を配置
- ダミーアセット配置: `public/sounds/success.mp3`、`public/icons/icon-{180,192,512}.png`
- `tsconfig.json` にパスエイリアス（`@/*`）設定

**完了条件**: `npm run dev` が起動し、`npm test` が実行できる状態

---

### Phase 1〜3: チーム並列実装

```
Phase 0 完了
    │
    ├──► Store Team    ──────────────────────────────────────────┐
    │                                                             │
    │  （Store完了後に以下3チームが並列起動）                       │
    │         │                                                   │
    │         ├──► Scanner Team （ScannerView + useCamera + playSound）│
    │         ├──► Success Team （SuccessView）                    │
    │         └──► Drawer Team  （SettingsDrawer）                 │
    │                   │                                         │
    │          （全チーム完了後）                                    │
    │                   ▼                                         │
    └──► Foundation Team（layout.tsx, globals.css, manifest.ts, page.tsx 統合）
```

| フェーズ | チーム | 担当ファイル | 依存関係 |
|---------|-------|------------|---------|
| Phase 0 | Foundation | 環境構築一式 | なし |
| Phase 1 | Store Team | `useMockStore.ts` + テスト | Phase 0完了後 |
| Phase 2 | Scanner Team | `ScannerView.tsx` + `useCamera.ts` + `playSound.ts` + テスト | Phase 1完了後 |
| Phase 2 | Success Team | `SuccessView.tsx` + テスト | Phase 1完了後 |
| Phase 2 | Drawer Team | `SettingsDrawer.tsx` + テスト | Phase 1完了後 |
| Phase 3 | Foundation | `layout.tsx` + `globals.css` + `manifest.ts` + `page.tsx` | Phase 2全チーム完了後 |

---

## 7. 実装順序（TDD・並列対応版）

### Phase 0: 環境構築

1. `create-next-app` でプロジェクト生成（TypeScript, Tailwind, App Router, src/ディレクトリ, `@` エイリアス）
2. 追加パッケージインストール: `framer-motion zustand lucide-react`
3. テスト環境インストール: `jest @testing-library/react @testing-library/jest-dom ts-jest`
4. `jest.config.ts` と `jest.setup.ts` を作成（getUserMediaモック含む）
5. ダミーアセット配置（`public/sounds/success.mp3`、アイコン3種）
6. `npm test` で空実行確認

---

### Phase 1: Store Team（TDD）

**Step 1-R（Red）**: `__tests__/store/useMockStore.test.ts` を作成し、S-01〜S-14のテストを記述。実行→全テスト失敗を確認。

**Step 1-G（Green）**: `src/store/useMockStore.ts` を実装。
- `currentView`、`themeColor`、`amount`、`shopName` の4フィールド
- persist（partialize: currentView除外）
- HEXバリデーション（C-4）
- NaNガード（I-3）

**Step 1-Refactor**: setter名・型定義を整理。テスト全パス確認。

---

### Phase 2: Scanner / Success / Drawer Team（並列・TDD）

**各チームの手順（並列実行）**:

1. **(Red)** テストファイルを作成し、失敗を確認
2. **(Green)** コンポーネント/フックを実装してテストをパス
3. **(Refactor)** コードを整理しテスト維持確認

#### Scanner Team
- `useCamera.ts`: `getUserMedia` 呼び出し + cleanup（C-5）
- `playSound.ts`: `Audio('/sounds/success.mp3')` + `.catch(console.warn)`（C-2, C-6）
- `ScannerView.tsx`: カメラ映像 + オーバーレイ + チート機能（playSound → setCurrentView）

#### Success Team
- `SuccessView.tsx`: チェックマークアニメーション + 金額/店舗名表示 + 戻るボタン

#### Drawer Team
- `SettingsDrawer.tsx`: トリガー領域（64px、C-3タイマー修正）+ プリセットカラー（I-11）+ HEXテキスト同期（I-7）

---

### Phase 3: Foundation Team（統合）

1. `app/globals.css`: `100dvh`、`overscroll-behavior: none`、`touch-action: pan-y`
2. `app/layout.tsx`: viewport meta、`apple-touch-icon`（icon-180.png、I-8）、manifest link
3. `app/manifest.ts`: `MetadataRoute.Manifest` 型（I-5）
4. `app/page.tsx`: `dynamic(import('./ScannerView or SuccessView'), { ssr: false })`（I-9）+ `currentView` による切替

---

### 最終確認

- 全 `__tests__/` のテストがグリーンであること
- モバイルブラウザ（iOS Safari / Android Chrome）で動作確認
- PWAとしてホーム画面に追加し、スタンドアロン起動を確認
- カメラ権限拒否時のフォールバックUIを確認
- 3タップでドロワーが開くこと、themeColor変更がリアルタイムに反映されることを確認
- リロード後に設定値が復元されること（persist確認）
