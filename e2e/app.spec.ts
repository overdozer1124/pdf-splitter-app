import { test, expect } from '@playwright/test';

test.describe('Offline PDF Toolbox E2E Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Tool Navigation & Privacy: App displays privacy notice and all 3 tool tabs', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'プライバシー保護声明' })).toBeVisible();
    await expect(page.getByText('このアプリではPDFや名簿データを外部サーバーへ送信しません')).toBeVisible();

    // Verify tool tabs
    await expect(page.getByRole('button', { name: /分割・一括命名/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /PDF結合/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /ページ整理・回転/ })).toBeVisible();

    // Switch to Merge tab
    await page.getByRole('button', { name: /PDF結合/ }).click();
    await expect(page.getByText('複数PDFの結合 (Merge)')).toBeVisible();

    // Switch to Organize tab
    await page.getByRole('button', { name: /ページ整理・回転/ }).click();
    await expect(page.getByText('ページの整理・回転・削除 (Organize)')).toBeVisible();
  });

  test('Offline Operation - App functions when network is offline', async ({ page, context }) => {
    // 1. Emulate offline network connection
    await context.setOffline(true);

    // 2. Ensure basic UI elements render offline
    await expect(page.getByRole('heading', { name: /オフライン PDF ツールボックス/ })).toBeVisible();
    await expect(page.getByRole('region', { name: 'プライバシー保護声明' })).toBeVisible();
  });
});

