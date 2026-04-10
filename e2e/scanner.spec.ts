import { test, expect } from '@playwright/test';

test.describe('スキャン画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // dynamic importのロード待ち
    await page.waitForTimeout(1000);
  });

  test('スキャン画面が表示される', async ({ page }) => {
    // ヘッダー「コード支払い」が表示される
    await expect(page.getByText('コード支払い')).toBeVisible();
  });

  test('カメラ権限なしでもフォールバックUIが表示される', async ({ page }) => {
    // カメラ権限を付与していないので、ダークグレー背景が表示されるはず
    // ヘッダーは表示されている
    await expect(page.getByText('コード支払い')).toBeVisible();
    // 「QRコードを枠内に収めてください」テキストが表示される
    await expect(page.getByText('QRコードを枠内に収めてください')).toBeVisible();
  });

  test('画面タップで決済完了画面に遷移する', async ({ page }) => {
    // スキャン画面の中央あたりをクリック
    await page.click('body', { position: { x: 187, y: 300 } });
    // 決済完了画面の要素を確認
    await expect(page.getByText('¥1,500')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/支払い先/)).toBeVisible();
  });

  test('ボトムナビゲーションバーが存在する', async ({ page }) => {
    // ボトムナビのアイコンエリアが存在する
    const bottomNav = page.locator('[class*="bottom-0"]').last();
    await expect(bottomNav).toBeVisible();
  });
});
