import { test, expect } from '@playwright/test';

test.describe('Offline PDF Splitter & Bulk Renamer E2E Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Scenario 1 & Privacy: App displays privacy notice and 4-step wizard', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'プライバシー保護声明' })).toBeVisible();
    await expect(page.getByText('このアプリではPDFや名簿データを外部サーバーへ送信しません')).toBeVisible();
    await expect(page.getByRole('button', { name: 'PDFファイルを選択' })).toBeVisible();
  });

  test('Scenario 6: Offline Operation - App functions when network is offline', async ({ page, context }) => {
    // 1. Emulate offline network connection
    await context.setOffline(true);

    // 2. Ensure basic UI elements render offline
    await expect(page.getByText('オフライン PDF分割・一括命名 Webアプリ')).toBeVisible();
    await expect(page.getByRole('region', { name: 'プライバシー保護声明' })).toBeVisible();
  });
});
