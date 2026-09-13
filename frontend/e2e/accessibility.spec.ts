import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { connecter, simulerApi, type Role } from './helpers/session';

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
const PAGES_PUBLIQUES = [
  { chemin: '/login', titre: 'Connexion à AdrenaBook' },
  { chemin: '/register', titre: 'Créer un compte aventurier' },
  { chemin: '/password-reset/request', titre: 'Mot de passe oublié ?' },
  { chemin: '/cgu', titre: /conditions générales/i },
  { chemin: '/rgpd', titre: /données personnelles|confidentialité|RGPD/i },
  { chemin: '/accessibilite', titre: /déclaration d'accessibilité/i },
];

/** Écrans authentifiés, avec le rôle qui y donne accès. */
const PAGES_AUTHENTIFIEES: {
  chemin: string;
  titre: RegExp;
  role: Role;
}[] = [
  {
    chemin: '/',
    titre: /activités suggérées|bonjour|réservations/i,
    role: 'aventurier',
  },
  {
    chemin: '/activities/search',
    titre: /trouvez votre prochaine aventure/i,
    role: 'aventurier',
  },
  { chemin: '/centers/map', titre: /carte des centres/i, role: 'aventurier' },
  {
    chemin: '/pro/centers',
    titre: /centres|mes centres/i,
    role: 'professionnel',
  },
  { chemin: '/admin/users', titre: /utilisateurs/i, role: 'admin' },
];

/** Audite la page courante et n'admet aucune violation bloquante. */
async function auditerPage(page: Page, chemin: string, titre: RegExp | string) {
  // On s'assure que la page a bien rendu son contenu avant d'auditer :
  // auditer un écran vide renverrait 0 violation sans rien prouver.
  // Le titre est cible par son texte et non par le role "heading" : sur
  // les pages de compte il est porte par un CardTitle shadcn, qui rend un
  // <div>. C'est un defaut d'accessibilite en soi, tracé hors de ce test.
  await expect(page.getByText(titre).first()).toBeVisible();

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
      `Violations a11y bloquantes sur ${chemin} :`,
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
  for (const { chemin, titre } of PAGES_PUBLIQUES) {
    test(`${chemin} : 0 violation WCAG AA bloquante`, async ({ page }) => {
      await simulerApi(page);
      await page.goto(chemin);
      await auditerPage(page, chemin, titre);
    });
  }
});

test.describe('Accessibilité — écrans authentifiés', () => {
  for (const { chemin, titre, role } of PAGES_AUTHENTIFIEES) {
    test(`${chemin} (${role}) : 0 violation WCAG AA bloquante`, async ({
      page,
    }) => {
      await simulerApi(page);
      await connecter(page, role);
      await page.goto(chemin);
      await auditerPage(page, chemin, titre);
    });
  }
});

test.describe('Accessibilité — mécanismes transverses', () => {
  test('le lien d’évitement cible le contenu principal', async ({ page }) => {
    await simulerApi(page);
    await connecter(page, 'aventurier');

    const lienEvitement = page.getByRole('link', {
      name: /aller au contenu principal/i,
    });

    // Il doit désigner une cible réellement présente, sinon il ne mène nulle
    // part.
    await expect(lienEvitement).toHaveAttribute('href', '#contenu-principal');
    await expect(page.locator('#contenu-principal')).toHaveCount(1);

    // Le lien vit hors de l'écran tant qu'il n'a pas le focus : on reproduit
    // le parcours réel — prise de focus, puis validation au clavier — plutôt
    // qu'un clic, impossible sur un élément hors cadre.
    await lienEvitement.focus();
    await expect(lienEvitement).toBeVisible();
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

    await simulerApi(page);
    await connecter(page, 'aventurier');

    await page.keyboard.press('Tab');
    const lienEvitement = page.getByRole('link', {
      name: /aller au contenu principal/i,
    });

    await expect(lienEvitement).toBeFocused();
    // Masqué au repos, il doit devenir visible une fois le focus reçu.
    await expect(lienEvitement).toBeVisible();
  });

  test('le document déclare la langue française', async ({ page }) => {
    await page.goto('/login');

    // Sans cette déclaration, un lecteur d'écran lit le français avec une
    // prononciation anglaise (RGAA 8.3).
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });
});
