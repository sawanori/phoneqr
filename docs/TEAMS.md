# チーム編成ドキュメント

## プロジェクト概要

撮影用QR決済モックアプリ（PWA）。Next.js App Router + TypeScript + Tailwind + Framer Motion + Zustand。

---

## 役割定義

| 役割 | モデル | 責務 |
|------|--------|------|
| **Manager** | Opus | オーケストレーター。計画立案・品質レビュー・同期ポイント判断。自身は実装しない |
| **各実装チーム** | Sonnet | subagentとして並列実行。TDD（Red→Green→Refactor）を独立して実施 |

---

## チーム編成と担当範囲

### Infrastructure Team（Phase 0: 先行実行）

- **担当**: Next.jsプロジェクト初期構築、パッケージインストール、テスト環境セットアップ、ダミーアセット配置
- **技術スタック**: Next.js App Router、Jest、Testing Library
- **成果物**:
  - 動作するNext.js環境
  - `jest.config.ts`
  - `jest.setup.ts`
  - ダミーファイル群（`success.mp3`、PWAアイコン）
- **依存**: なし（最初に実行）

---

### Store Team（Phase 1: Infrastructure完了後）

- **担当**: Zustand Store（persist + HEXバリデーション + NaNガード）
- **成果物**:
  - `src/store/useMockStore.ts`
  - `__tests__/store/useMockStore.test.ts`
- **依存**: Infrastructure Team完了
- **TDDテストケース**:
  - 初期値テスト
  - setterテスト
  - persist永続化/復元テスト
  - HEX無効値テスト
  - NaN入力テスト

---

### Scanner Team（Phase 2: Store完了後、並列実行可能）

- **担当**: ScannerView.tsx、useCamera.ts（cleanup付き）、playSound.ts
- **成果物**:
  - `src/components/ScannerView.tsx`
  - `src/hooks/useCamera.ts`
  - `src/utils/playSound.ts`
  - 各テストファイル
- **依存**: Store Team完了
- **TDDテストケース**:
  - カメラ起動/フォールバック
  - UIオーバーレイ（ヘッダー帯・マスク・四隅ボーダー・スキャンライン・ボトムナビ）
  - チートタップ遷移
  - 効果音再生
  - カメラストリームcleanup
- **並列**: Success Team、Drawer Teamと並列実行

---

### Success Team（Phase 2: Store完了後、並列実行可能）

- **担当**: SuccessView.tsx
- **成果物**:
  - `src/components/SuccessView.tsx`
  - `__tests__/components/SuccessView.test.tsx`
- **依存**: Store Team完了
- **TDDテストケース**:
  - チェックマークアニメーション
  - 金額フォーマット表示
  - 店舗名表示
  - themeColor適用
  - 戻るボタン
- **並列**: Scanner Team、Drawer Teamと並列実行

---

### Drawer Team（Phase 2: Store完了後、並列実行可能）

- **担当**: SettingsDrawer.tsx（タイマー修正版、プリセットカラー方式）
- **成果物**:
  - `src/components/SettingsDrawer.tsx`
  - `__tests__/components/SettingsDrawer.test.tsx`
- **依存**: Store Team完了
- **TDDテストケース**:
  - 3回タップ検出（タイマーリーク修正済み）
  - ドロワー開閉
  - 設定変更
  - stopPropagation
  - プリセットカラーボタン
  - HEXテキスト入力同期
- **並列**: Scanner Team、Success Teamと並列実行

---

### Foundation Team（Phase 3: 全チーム完了後）

- **担当**: アプリ基盤ファイル群の統合実装
- **成果物**:
  - `app/layout.tsx`
  - `app/globals.css`
  - `app/manifest.ts`
  - `app/page.tsx`（dynamic importでSSR無効化、`currentView`ステートでScannerView/SuccessView切替）
- **依存**: Scanner Team・Success Team・Drawer Team 全チーム完了

---

## 同期ポイント（品質ゲート）

| ゲート | タイミング | 実施内容 |
|--------|-----------|---------|
| **Phase 0→1 ゲート** | Infrastructure完了後 | 環境動作確認 |
| **Phase 1→2 ゲート** | Store Team完了後 | Manager（Opus）品質レビュー |
| **Phase 2→3 ゲート** | Scanner/Success/Drawer 全チーム完了後 | Manager（Opus）品質レビュー |
| **最終ゲート** | Foundation完了後 | 全テストGreen確認 + Manager（Opus）最終レビュー |

---

## 並列実行フロー

```
Phase 0: [Infrastructure Team] ─────────────────────────────────┐
                                                                  ▼
Phase 1: [Store Team] ───────────────────────────────────────────┐
                                                                  ▼
Phase 2: ┌─ [Scanner Team] ──────────────────────────────────┐
         ├─ [Success Team] ──────────────────────────────────┤ 並列
         └─ [Drawer Team]  ──────────────────────────────────┘
                                                                  ▼
Phase 3: [Foundation Team（統合）] ──────────────────────────────┐
                                                                  ▼
         [最終レビュー（Opus）]
```

---

## TDDサイクル（各チーム共通）

各チームは以下のサイクルを独立して実施する：

1. **Red**: 失敗するテストコードを先に書く。本番コードは書かない
2. **Green**: テストがパスするよう本番コードをステップバイステップで実装する
3. **Refactor**: 全テストパス後、可読性・保守性を高めるリファクタリングを行う。テストがパスし続けることを確認する
