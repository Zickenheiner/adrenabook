import { test, expect } from '@playwright/test';

/**
 * Squelettes des parcours critiques exigés par la US-27.
 *
 * Ces tests sont marqués `skip` pour l'instant car les pages correspondantes
 * (inscription US-01, réservation US-09, paiement US-11) ne sont pas encore
 * implémentées. Ils doivent être réactivés au fur et à mesure que ces US
 * arrivent en production.
 *
 * Garder ces tests visibles permet :
 *  - de matérialiser l'exigence "tests E2E sur parcours critiques"
 *  - de fournir un modèle clair aux développeurs futurs
 *  - de tracer l'intention dans le code source
 */
test.describe('Parcours critique : inscription', () => {
  test.skip('un aventurier peut créer un compte', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Mot de passe').fill('SecureP@ss123!');
    await page.getByRole('button', { name: /Créer mon compte/i }).click();
    await expect(page).toHaveURL(/\/(home|onboarding)/);
  });
});

test.describe('Parcours critique : réservation', () => {
  test.skip('un aventurier peut réserver une activité', async ({ page }) => {
    await page.goto('/activities');
    await page
      .getByRole('link', { name: /Saut en parachute/i })
      .first()
      .click();
    await page.getByRole('button', { name: /Réserver/i }).click();
    await expect(page.getByText(/Confirmer/)).toBeVisible();
  });
});

test.describe('Parcours critique : paiement', () => {
  test.skip('un aventurier peut payer une réservation', async ({ page }) => {
    await page.goto('/bookings/current/checkout');
    await page.getByLabel(/Carte bancaire/i).fill('4242 4242 4242 4242');
    await page.getByRole('button', { name: /Payer/i }).click();
    await expect(page.getByText(/Paiement confirmé/)).toBeVisible();
  });
});
