import { test, expect } from '@playwright/test';

test.describe('決済完了画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    // スキャン画面からタップで遷移
    await page.click('body', { position: { x: 187, y: 300 } });
    await page.waitForTimeout(500);
  });

  test('金額が正しく表示される', async ({ page }) => {
    await expect(page.getByText('¥1,500')).toBeVisible();
  });

  test('店舗名が表示される', async ({ page }) => {
    await expect(page.getByText(/NonTurn Cafe/)).toBeVisible();
  });

  test('チェックマークアニメーションが表示される', async ({ page }) => {
    // SVGのチェックマークが存在する
    const checkmark = page.locator('svg');
    await expect(checkmark.first()).toBeVisible();
  });

  test('「スキャンを続ける」ボタンでスキャン画面に戻れる', async ({ page }) => {
    const backButton = page.getByText('スキャンを続ける');
    await expect(backButton).toBeVisible();
    await backButton.click();
    // スキャン画面に戻ったことを確認
    await expect(page.getByText('コード支払い')).toBeVisible({ timeout: 3000 });
  });

  test('スキャン↔決済の往復遷移が正常に動作する', async ({ page }) => {
    // 決済完了 → スキャンに戻る
    await page.getByText('スキャンを続ける').click();
    await expect(page.getByText('コード支払い')).toBeVisible({ timeout: 3000 });
    // 再度タップで決済完了
    await page.click('body', { position: { x: 187, y: 300 } });
    await expect(page.getByText('¥1,500')).toBeVisible({ timeout: 3000 });
  });
});
