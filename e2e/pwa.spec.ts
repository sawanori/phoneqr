import { test, expect } from '@playwright/test';

test.describe('PWA基盤', () => {
  test('manifest.webmanifestが取得できる', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response?.status()).toBe(200);
    const manifest = await response?.json();
    expect(manifest.name).toBe('QR決済モック');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toHaveLength(2);
  });

  test('viewportメタタグが設定されている', async ({ page }) => {
    await page.goto('/');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('maximum-scale=1');
  });

  test('apple-touch-iconが設定されている', async ({ page }) => {
    await page.goto('/');
    const appleIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleIcon).toHaveAttribute('href', '/icons/icon-180.png');
  });
});
