import { test, expect } from '@playwright/test';

test.describe('設定ドロワー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('履歴ボタンをタップするとドロワーが開く', async ({ page }) => {
    // 履歴ボタンをクリック
    await page.getByText('履歴').click();
    // ドロワーの「撮影プロップ設定」が表示される
    await expect(page.getByText('撮影プロップ設定')).toBeVisible({ timeout: 2000 });
  });

  test('ドロワーで金額を変更すると決済完了画面に反映される', async ({ page }) => {
    // 履歴ボタンをクリックしてドロワーを開く
    await page.getByText('履歴').click();
    await expect(page.getByText('撮影プロップ設定')).toBeVisible({ timeout: 2000 });

    // 金額を変更
    const amountInput = page.getByTestId('amount-input');
    await amountInput.clear();
    await amountInput.fill('3000');

    // ドロワーを閉じる
    await page.getByText('閉じる').click();
    await page.waitForTimeout(500);

    // タップで決済完了画面へ
    await page.click('body', { position: { x: 187, y: 300 } });

    // 変更した金額が表示される
    await expect(page.getByText('¥3,000')).toBeVisible({ timeout: 3000 });
  });

  test('プリセットカラーボタンでテーマカラーが変更される', async ({ page }) => {
    // 履歴ボタンをクリックしてドロワーを開く
    await page.getByText('履歴').click();
    await expect(page.getByText('撮影プロップ設定')).toBeVisible({ timeout: 2000 });

    // 青のプリセットをクリック
    const bluePreset = page.getByTestId('preset-color-#0066ff');
    await bluePreset.click();

    // HEXテキスト入力が青に更新される
    const hexInput = page.getByTestId('theme-color-text-input');
    await expect(hexInput).toHaveValue('#0066ff');
  });

  test('店舗名を変更すると決済完了画面に反映される', async ({ page }) => {
    // 履歴ボタンをクリックしてドロワーを開く
    await page.getByText('履歴').click();
    await expect(page.getByText('撮影プロップ設定')).toBeVisible({ timeout: 2000 });

    // 店舗名を変更
    const shopInput = page.getByTestId('shop-name-input');
    await shopInput.clear();
    await shopInput.fill('テスト店舗');

    // ドロワーを閉じてタップで遷移
    await page.getByText('閉じる').click();
    await page.waitForTimeout(500);
    await page.click('body', { position: { x: 187, y: 300 } });

    // 変更した店舗名が表示される
    await expect(page.getByText(/テスト店舗/)).toBeVisible({ timeout: 3000 });
  });
});
