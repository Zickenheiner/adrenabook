import { test, expect } from '@playwright/test';

/**
 * Parcours critique : Page Santé du système (US-26).
 * Mocke la réponse de /health pour rendre le test déterministe et indépendant du backend.
 */
test.describe('Page Santé du système', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          version: '1.0.0-e2e',
          uptime: 12345,
          checks: {
            mongodb: 'ok',
            rabbitmq: 'ok',
            stripe: 'ok',
            sendgrid: 'ok',
          },
          responseTimeMs: 42,
        }),
      });
    });
  });

  test('affiche le tableau de bord lorsque le backend répond OK', async ({
    page,
  }) => {
    await page.goto('/system/health');

    await expect(
      page.getByRole('heading', { name: 'Santé du système' }),
    ).toBeVisible();
    await expect(page.getByText('Statut global')).toBeVisible();
    await expect(page.getByText('Métriques système')).toBeVisible();
    await expect(page.getByText('Dépendances surveillées')).toBeVisible();
    await expect(page.getByText('MongoDB')).toBeVisible();
    await expect(page.getByText('RabbitMQ')).toBeVisible();
    await expect(page.getByText('Stripe')).toBeVisible();
    await expect(page.getByText('SendGrid')).toBeVisible();
  });

  test("affiche l'état d'erreur lorsque /health échoue", async ({ page }) => {
    await page.unroute('**/health');
    await page.route('**/health', async (route) => {
      await route.fulfill({ status: 503, body: '{}' });
    });

    await page.goto('/system/health');

    await expect(page.getByText('Service indisponible')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Réessayer/i }),
    ).toBeVisible();
  });

  test('le bouton Rafraîchir relance une requête', async ({ page }) => {
    await page.goto('/system/health');
    await expect(
      page.getByRole('heading', { name: 'Santé du système' }),
    ).toBeVisible();

    const refreshButton = page.getByRole('button', { name: /Rafraîchir/i });
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Après clic, le statut reste visible (le mock répond toujours)
    await expect(page.getByText('Statut global')).toBeVisible();
  });
});
