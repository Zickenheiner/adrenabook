import type { Page } from '@playwright/test';

export type Role = 'aventurier' | 'professionnel' | 'admin';

/**
 * Jeton d'accès fabriqué pour les tests.
 *
 * Le front ne vérifie pas la signature : il décode le jeton pour adapter la
 * navigation, l'autorisation restant appliquée par l'API (voir
 * `core/utils/session.ts`). Un jeton non signé suffit donc à rendre les
 * écrans authentifiés, sans dépendre du backend ni d'un compte réel.
 */
function buildToken(role: Role): string {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const payload = {
    sub: '68b4d59919d9b7a94b4fde21',
    email: `${role}@example.test`,
    role,
    // Expiration lointaine : un jeton expiré déclencherait un rafraîchissement.
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature-de-test`;
}

/**
 * Ouvre une session en interceptant la connexion.
 *
 * Les jetons sont chiffrés par react-secure-storage selon l'empreinte du
 * navigateur : impossible de les injecter directement dans le stockage. On
 * passe donc par le vrai formulaire, dont on intercepte la réponse.
 */
export async function signIn(page: Page, role: Role): Promise<void> {
  const token = buildToken(role);

  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      // `user` est requis : le mapper de connexion le lit, et son absence
      // ferait échouer la mutation avant l'enregistrement du jeton.
      body: JSON.stringify({
        accessToken: token,
        refreshToken: token,
        user: {
          id: '68b4d59919d9b7a94b4fde21',
          email: `${role}@example.test`,
          role,
        },
      }),
    });
  });

  await page.goto('/login');
  // Cible le champ et non le bouton « Afficher le mot de passe », que le
  // libellé matcherait aussi.
  await page
    .getByRole('textbox', { name: /e-?mail/i })
    .fill(`${role}@example.test`);
  await page.locator('input[name="password"]').fill('MotDePasse123!');
  await page.getByRole('button', { name: /se connecter|connexion/i }).click();

  // La redirection hors de /login signe la prise en compte du jeton.
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 10_000,
  });
}

const ACTIVITY = {
  id: '68b4d59919d9b7a94b4fde30',
  title: 'Initiation escalade en falaise',
  type: 'escalade',
  difficulty: 'beginner',
  durationMinutes: 180,
  priceEur: 65,
  centerName: 'Vertical Chamonix',
  coverPhotoUrl: '',
};

/**
 * Réponses d'API neutres pour les écrans audités.
 *
 * L'audit porte sur le rendu, pas sur les données : servir des listes vides
 * ferait passer des pages sans contenu, donc chaque route renvoie de quoi
 * peupler l'écran.
 */
export async function stubApi(page: Page): Promise<void> {
  /**
   * Sert une réponse JSON, mais seulement à un appel de données.
   *
   * Les motifs d'URL des routes d'API recouvrent ceux des pages : un motif
   * attrapant `/centers` attrape aussi la navigation vers `/centers/map`, qui
   * recevrait alors du JSON au lieu de l'application. Tout ce qui n'est pas
   * une requête de données est donc laissé passer.
   */
  const stub = (motif: string, body: unknown) =>
    page.route(motif, (route) => {
      const type = route.request().resourceType();
      if (type !== 'fetch' && type !== 'xhr') {
        return route.fallback();
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });

  await stub('**/users/me/dashboard', {
    firstName: 'Lou',
    upcomingBookings: [],
    suggestedActivities: [
      {
        activityId: ACTIVITY.id,
        title: ACTIVITY.title,
        type: ACTIVITY.type,
        priceEur: ACTIVITY.priceEur,
        durationMinutes: ACTIVITY.durationMinutes,
        difficulty: ACTIVITY.difficulty,
        centerName: ACTIVITY.centerName,
        coverPhotoUrl: '',
      },
    ],
  });

  await stub('**/activities/search**', {
    items: [ACTIVITY],
    total: 1,
    page: 1,
    pageSize: 20,
  });

  await stub('**/activities/*/slots**', {
    slots: [],
    availableMonths: [],
  });

  await stub('**/centers**', {
    centers: [
      {
        id: '68b4d59919d9b7a94b4fde40',
        name: 'Vertical Chamonix',
        lat: 45.924,
        lng: 6.8685,
        city: 'Chamonix-Mont-Blanc',
        activitiesCount: 2,
      },
    ],
  });

  await stub('**/professional-center/mine', [
    {
      id: '68b4d59919d9b7a94b4fde40',
      companyName: 'Vertical Chamonix',
      status: 'approved',
      address: {
        street: '190 Place de l Eglise',
        city: 'Chamonix-Mont-Blanc',
        postalCode: '74400',
        country: 'France',
      },
    },
  ]);

  await stub('**/admin/users**', {
    data: [
      {
        id: '68b4d59919d9b7a94b4fde21',
        email: 'lou@example.test',
        firstName: 'Lou',
        lastName: 'Martin',
        role: 'aventurier',
        status: 'active',
        createdAt: '2026-01-15T10:00:00.000Z',
      },
    ],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
  });
}
