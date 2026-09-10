import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Audit accessibilité (WCAG AA / RGAA) sur les pages atteignables sans session.
 * Niveau bloquant : 0 violation de sévérité "serious" ou "critical".
 *
 * Le périmètre couvre les pages qu'un visiteur rencontre en premier, donc
 * celles où une barrière d'accessibilité empêche purement et simplement
 * d'entrer dans le service : les parcours de compte et les pages légales.
 * Les pages situées derrière l'authentification ne sont pas auditées ici :
 * les jetons sont chiffrés par react-secure-storage selon l'empreinte du
 * navigateur, donc impossibles à injecter sans démarrer le backend, ce qui
 * rendrait ce test dépendant de l'infrastructure.
 */
const PAGES_PUBLIQUES = [
  { chemin: '/login', titre: 'Connexion à AdrenaBook' },
  { chemin: '/register', titre: 'Créer un compte aventurier' },
  { chemin: '/password-reset/request', titre: 'Mot de passe oublié ?' },
  { chemin: '/cgu', titre: /conditions générales/i },
  { chemin: '/rgpd', titre: /données personnelles|confidentialité|RGPD/i },
];

test.describe('Accessibilité (axe-core)', () => {
  for (const { chemin, titre } of PAGES_PUBLIQUES) {
    test(`${chemin} : 0 violation WCAG AA bloquante`, async ({ page }) => {
      await page.goto(chemin);

      // On s'assure que la page a bien rendu son contenu avant d'auditer :
      // auditer un écran vide renverrait 0 violation sans rien prouver.
      // Le titre est cible par son texte et non par le role "heading" : sur
      // les pages de compte il est porte par un CardTitle shadcn, qui rend un
      // <div>. C'est un defaut d'accessibilite en soi, tracé hors de ce test.
      await expect(page.getByText(titre).first()).toBeVisible();

      // Les pages apparaissent en fondu (motion, 0,4 s). Auditer pendant le
      // fondu fait echouer le contraste sur des elements encore
      // semi-transparents : on attend que plus aucune opacite ne soit
      // intermediaire. 0 est admis, un element peut etre masque volontairement.
      await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('*')).every((el) => {
          const o = Number.parseFloat(getComputedStyle(el).opacity);
          return Number.isNaN(o) || o === 0 || o === 1;
        }),
      );

      // Un lecteur d'ecran navigue par titres : chaque page doit avoir un h1.
      await expect(page.locator('h1')).toHaveCount(1);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
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
    });
  }
});
