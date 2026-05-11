# Tests — AdrenaBook Frontend

Cette page documente la chaîne de tests automatisés mise en place pour la **US-27 — Tests automatisés avec coverage minimum**.

## Stack

| Couche              | Outil                                             | Cible          |
| ------------------- | ------------------------------------------------- | -------------- |
| Tests unitaires     | Vitest 4 + jsdom + Testing Library                | > 80% cov.     |
| Tests de composants | Vitest + @testing-library/react                   | inclus         |
| Tests E2E           | Playwright (Chromium / Firefox / WebKit / Mobile) | parcours       |
| Accessibilité       | axe-core/playwright                               | 0 violation AA |
| Coverage            | @vitest/coverage-v8 (v8 native)                   | lcov + html    |

## Scripts npm

| Script                     | Description                                                              |
| -------------------------- | ------------------------------------------------------------------------ |
| `npm test`                 | Lance Vitest une fois (CI mode)                                          |
| `npm run test:watch`       | Vitest en mode interactif                                                |
| `npm run test:ui`          | Vitest UI dans le navigateur                                             |
| `npm run test:coverage`    | Vitest + coverage v8 (échec si < 80% sur lignes/fns/branches/statements) |
| `npm run test:e2e`         | Playwright (lance `npm run preview` en background)                       |
| `npm run test:e2e:ui`      | Playwright Inspector                                                     |
| `npm run test:e2e:install` | Installe les navigateurs Playwright                                      |
| `npm run test:a11y`        | Exécute uniquement l'audit a11y axe-core                                 |
| `npm run test:all`         | Coverage + build + E2E (pipeline complet local)                          |

## Seuils de coverage

Configurés dans `vite.config.ts` (`test.coverage.thresholds`) :

```
lines      ≥ 80%
functions  ≥ 80%
branches   ≥ 80%
statements ≥ 80%
```

Les fichiers shadcn générés (`src/core/components/ui/**`), le bootstrap (`src/main.tsx`)
et le `Provider.tsx` sont exclus du calcul car non-métier.

## Structure des tests

```
src/
├── core/
│   └── utils/cn.test.ts                              # util
├── features/system/
│   ├── data/
│   │   ├── datasources/health.api.test.ts            # API + mock fetch
│   │   ├── mappers/health.mapper.test.ts             # DTO → Entity
│   │   └── repositories/health.repository.impl.test.ts # repo wiring
│   ├── domain/hooks/health.hook.test.tsx             # hook TanStack Query
│   └── presentation/
│       ├── components/
│       │   ├── HealthCheckCard.test.tsx
│       │   ├── HealthMetricsPanel.test.tsx
│       │   ├── HealthOverview.test.tsx
│       │   └── HealthStatusBadge.test.tsx
│       └── pages/SystemHealthPage.test.tsx           # page + états

e2e/
├── health.spec.ts                                    # parcours santé
├── accessibility.spec.ts                             # axe-core WCAG AA
└── critical-paths.spec.ts                            # inscription, réservation, paiement (skip)
```

## Conventions

- **Fichiers** : `<name>.test.ts` ou `<name>.test.tsx` à côté du fichier testé.
- **Tests E2E** : dans `e2e/`, suffixe `.spec.ts`.
- **Helpers** : `src/test/test-utils.tsx` expose `renderWithProviders` (QueryClient + Router).
- **Mocks** : utiliser `vi.mock()` pour les modules, jamais d'appel réseau réel.
- **Playwright** : toujours `page.route()` pour stubber `/health`, `/auth/*`, etc.

## Intégration CI

À ajouter dans `.github/workflows/ci.yml` :

```yaml
- run: npm ci
- run: npm run test:coverage
- run: npm run build
- run: npx playwright install --with-deps
- run: npm run test:e2e
- uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
```

## Badges (à ajouter au README)

```markdown
![Coverage](https://codecov.io/gh/<owner>/adrenabook/branch/main/graph/badge.svg)
![Tests](https://github.com/<owner>/adrenabook/actions/workflows/ci.yml/badge.svg)
![SonarCloud](https://sonarcloud.io/api/project_badges/measure?project=<key>&metric=alert_status)
```

## Parcours critiques

Les parcours E2E **inscription**, **réservation** et **paiement** sont matérialisés
dans `e2e/critical-paths.spec.ts` mais sont en `test.skip()` tant que les US correspondantes
(US-01, US-09, US-11) n'ont pas livré les pages associées. Ils doivent être
réactivés au fur et à mesure.
