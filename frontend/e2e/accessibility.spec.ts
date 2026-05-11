import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Audit accessibilité (WCAG AA / RGAA) sur les pages disponibles.
 * Niveau bloquant : 0 violation de sévérité "serious" ou "critical".
 */
test.describe('Accessibilité (axe-core)', () => {
  test('Page Santé du système : 0 violation WCAG AA', async ({ page }) => {
    await page.route('**/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          version: '1.0.0',
          uptime: 1000,
          checks: {
            mongodb: 'ok',
            rabbitmq: 'ok',
            stripe: 'ok',
            sendgrid: 'ok',
          },
          responseTimeMs: 50,
        }),
      });
    });

    await page.goto('/system/health');
    await expect(
      page.getByRole('heading', { name: 'Santé du système' }),
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    );

    if (blocking.length > 0) {
      console.error(
        'Violations a11y bloquantes :',
        JSON.stringify(blocking, null, 2),
      );
    }

    expect(blocking).toEqual([]);
  });
});
