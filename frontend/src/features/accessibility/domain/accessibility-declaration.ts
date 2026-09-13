/**
 * Déclaration d'accessibilité d'AdrenaBook.
 *
 * Versionnée dans le code plutôt que rédigée dans la page : une déclaration
 * d'accessibilité est un document opposable, dont chaque évolution doit
 * laisser une trace dans l'historique.
 *
 * Les valeurs décrivent l'état RÉEL et vérifiable du produit. Aucune ne doit
 * être relevée sans l'audit correspondant : une déclaration inexacte engage
 * l'éditeur.
 */

export interface NonConformity {
  criterion: string;
  detail: string;
}

export interface AccessibilityDeclaration {
  rgaaLevel: 'A' | 'AA' | 'AAA';
  conformityState:
    'non conforme' | 'partiellement conforme' | 'totalement conforme';
  lastAuditDate: string;
  auditedScope: string[];
  knownNonConformities: NonConformity[];
  contactEmail: string;
}

export const ACCESSIBILITY_DECLARATION: AccessibilityDeclaration = {
  rgaaLevel: 'AA',
  // « totalement conforme » suppose l'audit des 106 critères RGAA : tant que
  // les non-conformités ci-dessous subsistent, le revendiquer serait un faux.
  conformityState: 'partiellement conforme',
  lastAuditDate: '2026-09-13',

  /** Pages contrôlées automatiquement à chaque modification du code. */
  auditedScope: [
    '/login',
    '/register',
    '/password-reset/request',
    '/cgu',
    '/rgpd',
    '/accessibilite',
    '/ (accueil aventurier)',
    '/activities/search',
    '/centers/map',
    '/pro/centers',
    '/admin/users',
  ],

  knownNonConformities: [
    {
      criterion: '3.2 — Contraste des textes',
      detail:
        "La couleur d'accent orange (#f97316) est utilisée comme couleur de " +
        'texte sur fond clair, où elle atteint un rapport de 2,7:1 au lieu ' +
        'des 4,5:1 exigés. Sont concernés le nom du site dans la barre de ' +
        "navigation, l'onglet actif et les prix affichés sur les cartes " +
        "d'activité. En thème sombre, le rapport est de 7,9:1 et le critère " +
        'est respecté. Correction non engagée : elle touche la charte ' +
        'graphique du produit.',
    },
    {
      criterion: 'Méthodologie — audit manuel',
      detail:
        "L'audit porte sur les critères vérifiables automatiquement par " +
        'axe-core, soit environ un tiers des 106 critères du RGAA. ' +
        "L'audit manuel complet (navigation au lecteur d'écran, parcours " +
        "clavier exhaustif, pertinence des alternatives textuelles) n'a pas " +
        'été mené.',
    },
    {
      criterion: '4.1 — Média temporel',
      detail:
        'Les vidéos déposées par les professionnels ne disposent ni de ' +
        'sous-titres ni de transcription : rien dans le dépôt ne les réclame.',
    },
  ],

  contactEmail: 'accessibilite@adrenabook.fr',
};
