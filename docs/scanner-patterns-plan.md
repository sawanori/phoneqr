# スキャナーパターン実装計画書（レビュー修正版）

> 作成日: 2026-04-10
> ベース計画書: `docs/implementation-plan.md`
> 反映済みレビュー: CRITICAL C-1〜C-6 / INFORMATIONAL I-1〜I-8

---

## 1. アーキテクチャ変更点のサマリ

### 1-1. 文字列リテラル採用（I-4）

パターン識別子をenum/数値定数ではなく文字列リテラルユニオン型で定義する。

```typescript
export type ScannerPattern = 'standard' | 'minimal' | 'neon' | 'friendly';
```

**採用理由**:
- デバッグ時の可読性が高い（ログ・DevToolsで即座に意味を把握できる）
- JSONシリアライズと相性が良く、Zustand persistと自然に統合できる
- 追加パターンが増えた場合も型定義の追加だけで拡張できる

---

### 1-2. 3層防御によるPATTERN_MAP型安全性（C-3）

無効パターン値がUIを壊さないよう、以下の3層で防御する。

| 層 | 場所 | 内容 |
|----|------|------|
| 第1層 | setter | `setScannerPattern` でバリデーション。無効値は `'standard'` にフォールバック |
| 第2層 | 型定義 | `Record<ScannerPattern, ComponentType<OverlayProps>>` で網羅性を型で保証 |
| 第3層 | ScannerView | `PATTERN_MAP[pattern] ?? StandardOverlay` でランタイムフォールバック |

---

### 1-3. GPU負荷最適化方針（C-5）

アニメーションのGPU効率を最大化するため、以下のルールを全パターンで遵守する。

**禁止事項**:
- `box-shadow` をアニメーション対象プロパティにすること（再合成コストが高い）
- Framer Motionの `animate` に `box-shadow` / `background-color` / `border-color` などレイアウト・ペイントトリガープロパティを指定すること

**必須事項**:
- グロー・パルスなどの視覚効果は `::after` 疑似要素のopacity/transformのみでアニメーション
- `will-change: transform` はアニメーションが実際に起動する要素のみに付与する
- `@media (prefers-reduced-motion: reduce)` で回転・点滅アニメーションを停止する

---

### 1-4. 静的インポート維持（I-1）

4つのオーバーレイコンポーネントはすべて静的インポートとする。遅延ロード（`React.lazy` / `next/dynamic`）は使用しない。

**理由**:
- PWAのService Workerキャッシュにより初回以降の読み込みコストは実質ゼロ
- 遅延ロードにすると撮影現場でのパターン切替時に一瞬の白チラつきが生じる可能性がある

---

### 1-5. PWAスタンドアロン前提（C-6）

本アプリはPWAスタンドアロンモード（`display: standalone`）での利用を前提とする。

ヘッダーを省略するパターン（パターン2: minimal）を含むすべてのパターンで、画面上下にタッチイベントのガード領域（高さ20px程度の透明div、`touch-action: none`）を配置し、ブラウザUIへの誤操作を防止する。

---

## 2. ファイル構成（変更・追加対象）

```
phoneqr/
├── src/
│   ├── components/
│   │   ├── ScannerView.tsx              # 変更: PATTERN_MAP導入、oPointerEvents透過
│   │   ├── SettingsDrawer.tsx           # 変更: max-h-[60dvh]、パターン選択UI追加
│   │   └── overlays/                    # 新規ディレクトリ
│   │       ├── StandardOverlay.tsx      # パターン1: 標準（現行ScannerViewのオーバーレイ相当）
│   │       ├── MinimalOverlay.tsx       # パターン2: ミニマル（半透明マスクのみ）
│   │       ├── NeonOverlay.tsx          # パターン3: ネオン（グロー枠+回転コーナー）
│   │       └── FriendlyOverlay.tsx      # パターン4: フレンドリー（グラデーションヘッダー）
│   └── store/
│       └── useMockStore.ts              # 変更: scannerPattern フィールド追加
├── __tests__/
│   └── components/
│       ├── ScannerView.test.tsx         # 変更: オーバーレイモックでパターン切替ロジックのみテスト
│       ├── overlays/                    # 新規ディレクトリ
│       │   ├── StandardOverlay.test.tsx # 移管: V-05(themeColor)・V-06(ボトムナビ)テスト
│       │   ├── MinimalOverlay.test.tsx
│       │   ├── NeonOverlay.test.tsx
│       │   └── FriendlyOverlay.test.tsx
│       └── SettingsDrawer.test.tsx      # 変更: パターン選択UIテスト追加
```

---

## 3. 4パターンの詳細仕様

### 共通仕様（全パターン）

- **ルート要素**: `pointerEvents: 'none'` を設定（タップイベントを親のScannerViewに透過させる）
- **インタラクティブ要素**（ボトムナビのダミーボタン等）: `pointerEvents: 'auto'` を個別に付与。ただしタップしても何も起きないモック仕様
- **ガード領域**: 画面上下に `touch-action: none` の透明div（高さ20px）を配置
- **アクセシビリティ**: `@media (prefers-reduced-motion: reduce)` でアニメーションを停止・簡略化する

---

### パターン1: standard（標準）

既存のScannerViewオーバーレイをコンポーネントとして分離したもの。

| 要素 | 仕様 |
|------|------|
| ヘッダー帯 | 高さ `h-14`（56px）、`themeColor` 背景、「コード支払い」テキスト（中央、白）、左端Menu・右端Xアイコン |
| スキャンマスク | 画面全体に `rgba(0,0,0,0.6)` の半透明黒マスク、中央240×240pxのみ透明にくり抜き |
| QR読み取り枠 | 四隅にthemeColorのL字ボーダー（太さ4px、長さ32px） |
| スキャンライン | Framer Motion、duration: 1.8s、easeInOut、repeat: Infinity、repeatType: 'reverse'、高さ2px |
| ボトムナビ | 高さ `h-16`（64px）、白背景、Home/QrCode/Clockの3アイコン（QrCodeにthemeColorハイライト） |

---

### パターン2: minimal（ミニマル）

カメラ映像を最大限活かす、最小限のUI。

| 要素 | 仕様 |
|------|------|
| ヘッダー | なし |
| スキャンマスク | 薄い半透明黒マスク（`rgba(0,0,0,0.3)`）、中央240×240pxのみ透明 |
| QR読み取り枠 | 四隅に白のL字ボーダー（細め：太さ2px、長さ24px、opacity: 0.8） |
| スキャンライン | なし（UI要素を最小化） |
| ボトムナビ | なし |
| ガード領域 | 画面上下20px、`touch-action: none`、透明 |
| パルス効果 | QR枠の::after疑似要素で `transform: scale(1→1.02)` + `opacity(0.6→0)` のみ。box-shadow不使用 |

---

### パターン3: neon（ネオン）

サイバーパンク調の発光演出。GPU最適化済み。

| 要素 | 仕様 |
|------|------|
| ヘッダー帯 | 高さ `h-14`、黒背景（`#0a0a0a`）、「コード支払い」テキスト（themeColorで発光テキスト） |
| スキャンマスク | `rgba(0,0,0,0.75)` の濃い黒マスク |
| QR読み取り枠 | themeColorのL字ボーダー（太さ3px） |
| グロー効果 | 枠の`::after`疑似要素（固定`box-shadow`）の`opacity(0→1→0)`をアニメーション。周期3s、ease-in-out |
| コーナー装飾 | 4隅に細い線のコーナーマーカーが低速回転（360deg/8s）。`will-change: transform`を付与 |
| 回転停止条件 | `@media (prefers-reduced-motion: reduce)` で `animation-play-state: paused` |
| スキャンライン | themeColorの発光ライン（高さ2px、opacity 0.8、glow: 疑似要素で実装） |
| ボトムナビ | 黒背景（`#0a0a0a`）、アイコンはthemeColorまたはグレー |
| テキスト点滅 | steps()禁止。ease-in-outのフェードイン/フェードアウト（周期2s） |

---

### パターン4: friendly（フレンドリー）

温かみのあるグラデーションデザイン。CSS崩壊対策済み。

| 要素 | 仕様 |
|------|------|
| ヘッダー帯 | グラデーション背景（`themeColor → lighterColor`）、テキスト・アイコンに `textShadow: '0 1px 2px rgba(0,0,0,0.2)'` |
| スキャンマスク | `rgba(0,0,0,0.5)` の半透明マスク |
| QR読み取り枠 | 角丸グラデーションボーダー。`border-image`は使わずインナーボーダー方式で実装（下記参照） |
| ボトムナビ | 白背景、アイコンはthemeColorグラデーション |

**インナーボーダー方式（C-4対応）**:

```tsx
{/* 外側: グラデーション背景 */}
<div style={{
  background: `linear-gradient(135deg, ${themeColor}, ${lighterColor})`,
  borderRadius: '24px',
  padding: '3px',
}}>
  {/* 内側: 透明背景でスキャン枠と融合 */}
  <div style={{
    borderRadius: '21px',
    overflow: 'hidden',
    background: 'transparent',
  }}>
    {/* スキャン枠コンテンツ */}
  </div>
</div>
```

**lighterColor算出**: `themeColor` のHSL明度を+20%した色。または固定のセカンダリカラーを`themeColor`と組み合わせて使用。

---

## 4. Zustand Store変更仕様 (`src/store/useMockStore.ts`)

### 追加フィールド

| フィールド | 型 | デフォルト値 | 説明 |
|-----------|---|-------------|------|
| `scannerPattern` | `ScannerPattern` | `'standard'` | 現在選択中のスキャナーパターン |

### 追加setter仕様（バリデーション付き）

```typescript
const VALID_PATTERNS: ScannerPattern[] = ['standard', 'minimal', 'neon', 'friendly'];

setScannerPattern: (pattern) =>
  set({ scannerPattern: VALID_PATTERNS.includes(pattern) ? pattern : 'standard' }),
```

- 有効な文字列リテラル以外はすべて `'standard'` にフォールバック
- `undefined`・`null`・任意の文字列・型キャストによる不正値いずれも安全に処理される

### persist設定（更新版）

```typescript
persist(
  (set) => ({ ... }),
  {
    name: 'phoneqr-store',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      themeColor: state.themeColor,
      amount: state.amount,
      shopName: state.shopName,
      scannerPattern: state.scannerPattern, // パターンは永続化対象
    }),
  }
)
```

`currentView` は引き続き永続化対象外（リロード後にscannerに戻る）。

---

## 5. ScannerView変更仕様 (`src/components/ScannerView.tsx`)

### PATTERN_MAP定義

```typescript
import { StandardOverlay } from './overlays/StandardOverlay';
import { MinimalOverlay } from './overlays/MinimalOverlay';
import { NeonOverlay } from './overlays/NeonOverlay';
import { FriendlyOverlay } from './overlays/FriendlyOverlay';

// 第2層防御: 型でRecord全キーの網羅を保証
const PATTERN_MAP: Record<ScannerPattern, ComponentType<OverlayProps>> = {
  standard: StandardOverlay,
  minimal: MinimalOverlay,
  neon: NeonOverlay,
  friendly: FriendlyOverlay,
};
```

### オーバーレイ選択ロジック

```typescript
// 第3層防御: ?? でランタイムフォールバック
const OverlayComponent = PATTERN_MAP[scannerPattern] ?? StandardOverlay;
```

### pointerEvents透過

```tsx
{/* ScannerViewのルートdivは全体タップを受け取る */}
<div onClick={handleCheatTap} style={{ position: 'fixed', inset: 0 }}>
  <video ... />
  {/* オーバーレイはpointerEvents: 'none'でタップを透過させる */}
  <OverlayComponent
    themeColor={themeColor}
    style={{ pointerEvents: 'none' }}
  />
  {/* SettingsDrawerトリガーは独立して配置 */}
  <SettingsDrawer />
</div>
```

---

## 6. SettingsDrawer変更仕様 (`src/components/SettingsDrawer.tsx`)

### 高さ変更（I-5）

```diff
- <div className="max-h-[50dvh] overflow-y-auto">
+ <div className="max-h-[60dvh] overflow-y-auto">
```

パターン選択UIの追加でコンテンツが増えるため、表示領域を10dvh引き上げる。

### パターン選択UI追加

ドロワー内に「スキャナーデザイン」セクションを追加する。

```tsx
<section>
  <h3>スキャナーデザイン</h3>
  <div className="grid grid-cols-2 gap-2">
    {(['standard', 'minimal', 'neon', 'friendly'] as ScannerPattern[]).map((p) => (
      <button
        key={p}
        onClick={() => setScannerPattern(p)}
        className={cn(
          'rounded-lg border-2 p-3 text-sm',
          scannerPattern === p ? 'border-current font-bold' : 'border-gray-200',
        )}
        style={scannerPattern === p ? { borderColor: themeColor } : undefined}
      >
        {PATTERN_LABELS[p]}
      </button>
    ))}
  </div>
</section>
```

**パターンラベル定義**:

| キー | 表示名 |
|------|--------|
| `standard` | スタンダード |
| `minimal` | ミニマル |
| `neon` | ネオン |
| `friendly` | フレンドリー |

---

## 7. テストケースリスト

### 7-0. 既存テストの修正計画（C-1対応）

**現状**: V-05（ヘッダーthemeColor）・V-06（ボトムナビ）は `ScannerView.test.tsx` に記述されている。

**修正方針**:
- V-05・V-06 を `__tests__/components/overlays/StandardOverlay.test.tsx` に移管する
- `ScannerView.test.tsx` はオーバーレイコンポーネントをモックし、「パターンに応じて正しいオーバーレイが描画されるか」のロジックのみをテストする

**ScannerViewでのオーバーレイモック**:

```typescript
jest.mock('../src/components/overlays/StandardOverlay', () => ({
  StandardOverlay: () => <div data-testid="overlay-standard" />,
}));
jest.mock('../src/components/overlays/MinimalOverlay', () => ({
  MinimalOverlay: () => <div data-testid="overlay-minimal" />,
}));
// neon, friendly も同様
```

---

### 7-1. useMockStore テスト（追加分）

既存テスト S-01〜S-14 に以下を追加する。

#### scannerPattern 正常系

| # | テストケース |
|---|------------|
| S-15 | 初期値 `scannerPattern` が `'standard'` である |
| S-16 | `setScannerPattern('minimal')` で `scannerPattern` が `'minimal'` に更新される |
| S-17 | `setScannerPattern('neon')` で `scannerPattern` が `'neon'` に更新される |
| S-18 | `setScannerPattern('friendly')` で `scannerPattern` が `'friendly'` に更新される |

#### scannerPattern 異常系（C-2対応）

| # | テストケース |
|---|------------|
| S-19 | `setScannerPattern('unknown' as any)` → `scannerPattern` が `'standard'` にフォールバック |
| S-20 | `setScannerPattern('' as any)` → `'standard'` にフォールバック |
| S-21 | `setScannerPattern(null as any)` → `'standard'` にフォールバック |
| S-22 | `setScannerPattern(undefined as any)` → `'standard'` にフォールバック |

#### persist永続化テスト（追加分）

| # | テストケース |
|---|------------|
| S-23 | `scannerPattern` が localStorage に保存される（永続化対象）|
| S-24 | localStorage に保存済みの `scannerPattern: 'neon'` がstore初期化時に復元される |
| S-25 | localStorage の `scannerPattern` が無効値の場合、`'standard'` で初期化される |

---

### 7-2. ScannerView テスト（修正版）

**V-05・V-06は本ファイルから削除し、StandardOverlay.test.tsxに移管。**

オーバーレイは全件モックし、ScannerView本体のロジックのみをテストする。

| # | テストケース |
|---|------------|
| V-01 | 画面をタップすると `setCurrentView('success')` が呼ばれる |
| V-02 | タップ前に `playSound()` が呼ばれる |
| V-03 | カメラエラー時にダークグレー背景が表示される |
| V-04 | カメラエラー時もタップで `setCurrentView('success')` が呼ばれる |
| V-07 | `scannerPattern === 'standard'` のとき `data-testid="overlay-standard"` が描画される |
| V-08 | `scannerPattern === 'minimal'` のとき `data-testid="overlay-minimal"` が描画される |
| V-09 | `scannerPattern === 'neon'` のとき `data-testid="overlay-neon"` が描画される |
| V-10 | `scannerPattern === 'friendly'` のとき `data-testid="overlay-friendly"` が描画される |
| V-11 | PATTERN_MAP に存在しないパターン値（バイパス時）でも StandardOverlay がフォールバックで描画される |

---

### 7-3. StandardOverlay テスト（移管・新規）

`__tests__/components/overlays/StandardOverlay.test.tsx`

| # | テストケース | 旧ID |
|---|------------|------|
| SO-01 | ヘッダーに `themeColor` が背景色として適用されている | V-05（移管） |
| SO-02 | ボトムナビが描画されている | V-06（移管） |
| SO-03 | スキャンライン要素が存在する | 新規 |
| SO-04 | QR枠の四隅ボーダーに `themeColor` が適用されている | 新規 |
| SO-05 | `pointerEvents: 'none'` がルート要素に設定されている | 新規 |

---

### 7-4. MinimalOverlay テスト

`__tests__/components/overlays/MinimalOverlay.test.tsx`

| # | テストケース |
|---|------------|
| MO-01 | ヘッダー要素が描画されない |
| MO-02 | ボトムナビ要素が描画されない |
| MO-03 | スキャンマスクが描画されている（`rgba(0,0,0,0.3)` 相当） |
| MO-04 | QR枠の四隅ボーダーが白色（`#ffffff` または `white`）で描画される |
| MO-05 | `pointerEvents: 'none'` がルート要素に設定されている |
| MO-06 | 上下ガード領域（`touch-action: none`の透明div）が描画されている |

---

### 7-5. NeonOverlay テスト

`__tests__/components/overlays/NeonOverlay.test.tsx`

| # | テストケース |
|---|------------|
| NO-01 | ヘッダーが黒背景（`#0a0a0a`）で描画される |
| NO-02 | ボトムナビが黒背景で描画される |
| NO-03 | QR枠の四隅ボーダーに `themeColor` が適用されている |
| NO-04 | `pointerEvents: 'none'` がルート要素に設定されている |
| NO-05 | `prefers-reduced-motion: reduce` 環境ではアニメーションが停止する（CSSクラス確認） |

---

### 7-6. FriendlyOverlay テスト

`__tests__/components/overlays/FriendlyOverlay.test.tsx`

| # | テストケース |
|---|------------|
| FO-01 | ヘッダーにグラデーション背景（`themeColor` を含む）が適用されている |
| FO-02 | ヘッダーテキストに `textShadow` が設定されている（I-8対応） |
| FO-03 | ヘッダーアイコンに `textShadow` が設定されている（I-8対応） |
| FO-04 | QR枠がインナーボーダー方式（外側div + 内側div の2層構造）で描画されている |
| FO-05 | `pointerEvents: 'none'` がルート要素に設定されている |

---

### 7-7. SettingsDrawer テスト（追加分）

既存テスト D-01〜D-13 に以下を追加する。

| # | テストケース |
|---|------------|
| D-14 | パターン選択UIが4つのボタン（スタンダード/ミニマル/ネオン/フレンドリー）を表示する |
| D-15 | 「ミニマル」ボタンをクリックすると `setScannerPattern('minimal')` が呼ばれる |
| D-16 | 現在選択中のパターンに対応するボタンが `themeColor` ボーダーでハイライトされる |
| D-17 | ドロワーの高さが `max-h-[60dvh]` クラスを持つ |

---

## 8. エラー＆レスキューマップ（更新版）

| 処理 | 想定される異常 | ハンドリング方法 | ユーザーへの影響 |
|------|--------------|----------------|---------------|
| `setScannerPattern` 呼び出し | 無効パターン文字列（型キャスト・LocalStorageの破損等） | バリデーション（第1層）で弾き `'standard'` にフォールバック | UIは標準パターンで継続表示。データ消失なし |
| `PATTERN_MAP[pattern]` 参照 | undefined（将来の型追加漏れ等） | `?? StandardOverlay`（第3層）でフォールバック | オーバーレイは標準表示。サイレント障害なし |
| グロー/パルスアニメーション | 低スペック端末でのフレーム落ち | GPU最適化済み（opacityのみアニメーション）。`prefers-reduced-motion`対応 | アニメーションが停止または簡略化。機能は継続 |
| インナーボーダー構造（パターン4） | `border-image` との互換性問題（旧実装） | 2層div方式に変更（C-4対応）。CSSプロパティの依存なし | レイアウト崩れなし |
| `getUserMedia` 呼び出し | カメラ権限拒否 / デバイス非対応 | catch で `error` state にメッセージ格納 | ダークグレー背景表示。タップ遷移は継続動作 |
| カメラストリーム取得後 | コンポーネントアンマウント（ページ離脱等） | `useEffect` cleanup で `track.stop()` を呼び出す | カメラリソースが適切に解放される |
| `Audio.play()` 呼び出し | Autoplay Policyによる再生拒否 / ファイル未配置 | `.catch(console.warn)` で警告ログ出力 | 効果音なしで遷移は正常に続行 |
| `setThemeColor` 呼び出し | 無効HEX値（入力ミス等） | バリデーションで弾き `#ff0033` にフォールバック | UI崩れなし。不正値は無視される |
| `setAmount` 呼び出し | NaN（空入力→Number変換等） | `isNaN` チェックで弾き `0` にフォールバック | 金額が `¥0` で表示される。安全に継続 |
| localStorage read/write | プライベートブラウジング / ストレージ満杯 | Zustand persistの内部try-catchに委ねる | 状態の永続化が無効化されるが、アプリは動作継続 |
| localStorage の `scannerPattern` 破損 | 無効な文字列値 | setter経由で復元時もバリデーション適用。`'standard'` で初期化 | リロード後に標準パターンにリセットされる |
| タップカウントタイマー | アンマウント後のsetState呼び出し | `useEffect` cleanup で `clearTimeout` | メモリリークなし。コンソールエラーなし |

---

## 9. 実装順序（依存関係修正版）

### 依存関係グラフ

```
Phase A: Store拡張（scannerPattern追加）────────┐
                                                │
Phase B: 4オーバーレイ作成                       │  ← A・B 並列可
（StandardOverlay/MinimalOverlay/               │    オーバーレイはStore不依存
 NeonOverlay/FriendlyOverlay）                  │
                                                ▼
Phase C: ScannerView変更──────────────────────┐
（PATTERN_MAP導入、pointerEvents設定、         │  ← C・D 並列可
 既存テストV-05・V-06の移管）                   │
                                               │
Phase D: SettingsDrawer変更──────────────────┘
（max-h-[60dvh]、パターン選択UI追加）
                                               ▼
Phase E: 最終統合確認
（全テストグリーン確認・実機動作確認）
```

---

### Phase A: Store拡張（TDD）

**Step A-R（Red）**: S-15〜S-25のテストを `useMockStore.test.ts` に追記。実行→失敗を確認。

**Step A-G（Green）**:
- `ScannerPattern` 型を定義（`src/types/scanner.ts` または store内）
- `useMockStore.ts` に `scannerPattern` フィールドと `setScannerPattern` setter を追加
- `VALID_PATTERNS` バリデーション配列を定義
- persist の `partialize` に `scannerPattern` を追加

**Step A-Refactor**: 型エクスポートの整理。テスト全パス確認。

---

### Phase B: オーバーレイ作成（A完了後に開始、4コンポーネント並列可）

各コンポーネントのTDDサイクル（Red → Green → Refactor）:

1. テストファイルを作成し失敗を確認（Red）
2. コンポーネントを実装してテストをパス（Green）
3. GPU最適化・アクセシビリティを確認しリファクタリング（Refactor）

**StandardOverlay**:
- 既存ScannerViewのオーバーレイ部分をコンポーネントとして抽出
- `pointerEvents: 'none'` を追加
- SO-01〜SO-05のテスト

**MinimalOverlay**:
- ヘッダー・ボトムナビなし
- パルス効果は `::after` + opacity/transformのみ（box-shadow不使用）
- MO-01〜MO-06のテスト

**NeonOverlay**:
- グロー: 固定box-shadowを持つ`::after`要素のopacityをアニメーション
- `@media (prefers-reduced-motion: reduce)` 対応
- テキスト点滅: ease-in-outフェード（周期2s）、steps()禁止
- NO-01〜NO-05のテスト

**FriendlyOverlay**:
- グラデーションヘッダー（インナーボーダー方式）
- テキスト・アイコンに `textShadow`
- FO-01〜FO-05のテスト

---

### Phase C: ScannerView変更（A+B完了後に開始）

**既存テスト修正（C-1対応）**:
1. `ScannerView.test.tsx` から V-05・V-06 を削除
2. 4オーバーレイを全件モック
3. V-07〜V-11のテストを追加

**実装変更**:
1. `PATTERN_MAP` と静的インポートを追加（I-1）
2. `OverlayComponent = PATTERN_MAP[scannerPattern] ?? StandardOverlay` の切替ロジック（C-3）
3. `OverlayComponent` に `style={{ pointerEvents: 'none' }}` を渡す（I-7）

---

### Phase D: SettingsDrawer変更（A+B完了後に開始、Cと並列可）

1. D-14〜D-17のテストを `SettingsDrawer.test.tsx` に追加（Red）
2. ドロワー高さを `max-h-[60dvh]` に変更（I-5）
3. パターン選択UIセクションを追加
4. テストをパスさせる（Green）
5. 選択中パターンのハイライト表示を整理（Refactor）

---

### Phase E: 最終統合確認

- `npm test` で全テストグリーンを確認
- モバイルブラウザ（iOS Safari / Android Chrome）で4パターン各々の動作確認
- PWAスタンドアロンモードで起動し、ブラウザUI誤操作ガードを確認
- `prefers-reduced-motion` 有効時のアニメーション停止を確認
- SettingsDrawerでパターン切替後、即座にオーバーレイが切り替わることを確認

---

## 10. 並列開発チーム構成

### チーム編成

| チーム | 担当 | 対象フェーズ |
|--------|------|------------|
| **Store Team（Sonnet）** | Store拡張、型定義 | Phase A |
| **Overlay Team A（Sonnet）** | StandardOverlay・MinimalOverlay | Phase B（並列） |
| **Overlay Team B（Sonnet）** | NeonOverlay・FriendlyOverlay | Phase B（並列） |
| **Scanner Team（Sonnet）** | ScannerView変更、テスト移管 | Phase C |
| **Drawer Team（Sonnet）** | SettingsDrawer変更 | Phase D（Cと並列） |
| **QA / Manager（Opus）** | アーキテクトレビュー・最終統合確認 | Phase E |

### 並列実行タイムライン

```
Phase A（Store Team）
├── 完了後に Phase B・C・D が開始可能

Phase B（Overlay Team A + B）
├── A と並列開始可（オーバーレイはStore未使用）
├── B完了後に Phase C が開始

Phase C（Scanner Team）+ Phase D（Drawer Team）
├── 並列実行可

Phase E（QA / Manager）
└── C・D 完了後に統合確認
```

### 品質ゲート（Managerが実施）

1. **Phase A完了時**: setter型定義・バリデーションロジックのレビュー
2. **Phase B完了時**: 各オーバーレイのGPU最適化・アクセシビリティ確認
3. **Phase C+D完了時**: テスト全グリーン確認、PATTERN_MAPのフォールバック動作確認
4. **Phase E（最終）**: 実機確認・パフォーマンス確認

---

*以上。本計画書はすべてのレビュー指摘（CRITICAL C-1〜C-6・INFORMATIONAL I-1〜I-8）を反映した修正版である。*
