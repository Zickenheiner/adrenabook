import { test, expect } from '@playwright/test';

/**
 * Parcours critique : Page Santé du système (US-26).
 *
 * Suite désactivée, et non supprimée : `/system/health` est une route privée
 * (voir `PrivateRoutes` dans `src/app/Router.tsx`), or ces tests ne disposent
 * d'aucune session. Le garde `Private` redirige donc vers `/login` avant que
 * la page ne soit rendue.
 *
 * Ouvrir cette suite suppose une session authentifiée. Les jetons étant
 * chiffrés par `react-secure-storage` à partir d'une empreinte du navigateur,
 * ils ne peuvent pas être injectés depuis le contexte de test : il faut passer
 * par un vrai `POST /auth/login`, donc démarrer le backend et MongoDB en plus
 * du serveur de préversion dans `playwright.config.ts`. C'est la seule voie
 * correcte, mais elle fait dépendre l'E2E de l'infrastructure.
 *
 * Les deux corrections ci-dessous sont déjà appliquées pour que la suite soit
 * juste le jour où elle sera réactivée :
 *   - le motif `**\/health` laissait passer la navigation vers
 *     `/system/health`, si bien que la page recevait le JSON brut au lieu du
 *     document HTML ;
 *   - le mock déclarait un check `rabbitmq` que le backend n'expose plus.
 */
test.describe.skip('Page Santé du système', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/health', async (route) => {
      // Seules les requêtes de données sont simulées : interception d'une
      // navigation renverrait du JSON à la place de la page.
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          version: '1.0.0-e2e',
          uptime: 12345,
          checks: {
            mongodb: 'ok',
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
    await expect(page.getByText('Stripe')).toBeVisible();
    await expect(page.getByText('SendGrid')).toBeVisible();
  });

  test("affiche l'état d'erreur lorsque /health échoue", async ({ page }) => {
    await page.unroute('**/health');
    await page.route('**/health', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
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
