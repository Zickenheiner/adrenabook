import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { signIn, stubApi, type Role } from './helpers/session';

/**
 * Audit accessibilité (WCAG AA / RGAA) sur les pages atteignables sans session.
 * Niveau bloquant : 0 violation de sévérité "serious" ou "critical".
 *
 * Le périmètre couvre les pages publiques — celles où une barrière empêche
 * purement et simplement d'entrer dans le service — puis les écrans
 * authentifiés, où vit l'essentiel de l'application.
 *
 * Les jetons étant chiffrés par react-secure-storage selon l'empreinte du
 * navigateur, ils ne peuvent pas être injectés dans le stockage : la session
 * est ouverte via le vrai formulaire, dont la réponse est interceptée. Les
 * appels d'API sont simulés, donc l'audit ne dépend ni du backend ni d'un
 * compte réel.
 */
const PUBLIC_PAGES = [
  { path: '/login', title: 'Connexion à AdrenaBook' },
  { path: '/register', title: 'Créer un compte aventurier' },
  { path: '/password-reset/request', title: 'Mot de passe oublié ?' },
  { path: '/cgu', title: /conditions générales/i },
  { path: '/rgpd', title: /données personnelles|confidentialité|RGPD/i },
  { path: '/accessibilite', title: /déclaration d'accessibilité/i },
];

/** Écrans authentifiés, avec le rôle qui y donne accès. */
const AUTHENTICATED_PAGES: {
  path: string;
  title: RegExp;
  role: Role;
}[] = [
  {
    path: '/',
    title: /activités suggérées|bonjour|réservations/i,
    role: 'aventurier',
  },
  {
    path: '/activities/search',
    title: /trouvez votre prochaine aventure/i,
    role: 'aventurier',
  },
  { path: '/centers/map', title: /carte des centres/i, role: 'aventurier' },
  {
    path: '/pro/centers',
    title: /centres|mes centres/i,
    role: 'professionnel',
  },
  { path: '/admin/users', title: /utilisateurs/i, role: 'admin' },
];

/** Audite la page courante et n'admet aucune violation bloquante. */
async function auditPage(page: Page, path: string, title: RegExp | string) {
  // On s'assure que la page a bien rendu son contenu avant d'auditer :
  // auditer un écran vide renverrait 0 violation sans rien prouver.
  // Le title est cible par son texte et non par le role "heading" : sur
  // les pages de compte il est porte par un CardTitle shadcn, qui rend un
  // <div>. C'est un defaut d'accessibilite en soi, tracé hors de ce test.
  await expect(page.getByText(title).first()).toBeVisible();

  // Les pages apparaissent en fondu (motion, 0,4 s). Auditer pendant le fondu
  // ferait échouer des règles sur des éléments encore semi-transparents.
  //
  // Seuls les éléments animés sont examinés : motion pose l'opacité en style
  // inline, alors qu'une opacité réduite posée par une classe (un élément
  // désactivé, par exemple) est permanente et ne se résoudra jamais.
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[style*="opacity"]')].every((el) => {
      const opacite = Number((el as HTMLElement).style.opacity);
      return Number.isNaN(opacite) || opacite === 0 || opacite === 1;
    }),
  );

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Écartée sciemment, et déclarée comme non-conformité connue (critère
    // RGAA 3.2) dans `domain/accessibility-declaration.ts` : la couleur
    // d'accent orange n'atteint que 2,7:1 sur fond clair. La corriger
    // reviendrait à modifier la charte graphique du produit, décision qui
    // n'appartient pas à ce test. À retirer d'ici dès que la charte évolue.
    .disableRules(['color-contrast'])
    .analyze();

  const blocking = results.violations.filter((v) =>
    ['serious', 'critical'].includes(v.impact ?? ''),
  );

  if (blocking.length > 0) {
    console.error(
      `Violations a11y bloquantes sur ${path} :`,
      JSON.stringify(
        blocking.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          cibles: v.nodes.map((n) => n.target),
        })),
        null,
        2,
      ),
    );
  }

  expect(blocking).toEqual([]);
}

test.describe('Accessibilité — pages publiques', () => {
  for (const { path, title } of PUBLIC_PAGES) {
    test(`${path} : 0 violation WCAG AA bloquante`, async ({ page }) => {
      await stubApi(page);
      await page.goto(path);
      await auditPage(page, path, title);
    });
  }
});

test.describe('Accessibilité — écrans authentifiés', () => {
  for (const { path, title, role } of AUTHENTICATED_PAGES) {
    test(`${path} (${role}) : 0 violation WCAG AA bloquante`, async ({
      page,
    }) => {
      await stubApi(page);
      await signIn(page, role);
      await page.goto(path);
      await auditPage(page, path, title);
    });
  }
});

test.describe('Accessibilité — mécanismes transverses', () => {
  test('le lien d’évitement cible le contenu principal', async ({ page }) => {
    await stubApi(page);
    await signIn(page, 'aventurier');

    const skipLink = page.getByRole('link', {
      name: /aller au contenu principal/i,
    });

    // Il doit désigner une cible réellement présente, sinon il ne mène nulle
    // part.
    await expect(skipLink).toHaveAttribute('href', '#contenu-principal');
    await expect(page.locator('#contenu-principal')).toHaveCount(1);

    // Le lien vit hors de l'écran tant qu'il n'a pas le focus : on reproduit
    // le parcours réel — prise de focus, puis validation au clavier — plutôt
    // qu'un clic, impossible sur un élément hors cadre.
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
    await page.keyboard.press('Enter');

    await expect(page.locator('#contenu-principal')).toBeFocused();
  });

  test('le lien d’évitement est le premier élément atteint au clavier', async ({
    page,
    browserName,
  }) => {
    // Safari n'amène pas le focus sur les liens à la tabulation tant que
    // l'option système correspondante est désactivée, et un navigateur mobile
    // n'a pas de clavier : l'ordre de tabulation ne s'y vérifie pas. Le
    // mécanisme reste couvert par les deux autres moteurs.
    test.skip(
      browserName === 'webkit',
      'Safari ne tabule pas sur les liens par défaut',
    );
    test.skip(
      test.info().project.name === 'mobile-chrome',
      'Pas de navigation clavier sur mobile',
    );

    await stubApi(page);
    await signIn(page, 'aventurier');

    // Repartir d'un chargement propre : après la connexion, le focus hérite
    // du bouton disparu avec la redirection, et l'ordre de tabulation n'est
    // alors plus celui d'une arrivée sur la page.
    await page.goto('/');

    const skipLink = page.getByRole('link', {
      name: /aller au contenu principal/i,
    });
    // `waitForURL` rend la main sur le changement d'URL, pas sur le rendu :
    // sans cette attente, une machine lente tabule avant que la mise en page
    // ne soit montée, et la tabulation ne rencontre encore aucun lien.
    await expect(skipLink).toBeAttached();

    await page.keyboard.press('Tab');

    await expect(skipLink).toBeFocused();
    // Masqué au repos, il doit devenir visible une fois le focus reçu.
    await expect(skipLink).toBeVisible();
  });

  test('le document déclare la langue française', async ({ page }) => {
    await page.goto('/login');

    // Sans cette déclaration, un lecteur d'écran lit le français avec une
    // prononciation anglaise (RGAA 8.3).
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });
});
