---
name: backend
description: Implemente une user story complete via un pipeline multi-agents (Notion → Architect → Scaffolder → Implementer → QA → Git)
---

# Commande /backend — Implementation automatique d'une User Story

## Parametres

Arguments recus : `$ARGUMENTS`

Parse les arguments :

- Le **premier argument numerique** est le numero de la User Story (ex: `3` → US-03)
- Si `--plan` est present, activer le **mode plan** (afficher le plan sans executer)

## Identification du projet Notion

Avant d'executer le pipeline, **deduit le nom du projet Notion** depuis le basename du repo local :

1. Recupere le nom du dossier racine du repo (ex: `adrenabook` → `AdrenaBook` en PascalCase).
2. Le dossier projet Notion correspondant a le format `📁 {NomProjet}` (ex: `📁 AdrenaBook`), parent commun de :
   - La database `📋 User Stories — {NomProjet}`
   - La page `🎨 Charte Graphique — {NomProjet}`
   - La page `📝 Dossier de validation — {NomProjet}`
3. Si le dossier projet n'est pas trouve, prevenir l'utilisateur et arreter.

Cette information (`{NomProjet}`) doit etre transmise a l'agent `notion-reader`.

## Pipeline d'execution

Execute les agents suivants **dans l'ordre**, en lisant les instructions detaillees de chaque agent dans `.claude/agents/`.

---

### Etape 1 — Notion Reader

Lis et suis les instructions de `.claude/agents/notion-reader.md`.

**Objectif** : Recuperer la user story US-{numero} depuis la database `📋 User Stories — {NomProjet}` (sous le dossier `📁 {NomProjet}`) via le MCP Notion, parser son contenu (proprietes + corps de page).

**Livrable** : Un resume structure de la US avec toutes les infos necessaires a l'implementation.

Si la US n'est pas trouvee ou est deja marquee comme "Fait", previens l'utilisateur et arrete.

Mets le **`Statut Back`** de la US a **"En cours"** dans Notion.

---

### Etape 2 — Architect

Lis et suis les instructions de `.claude/agents/architect.md`.

**Objectif** : Analyser la US et produire un plan d'implementation detaille.

**Livrable** : Liste complete de :

- Features a creer/modifier (noms pour `feature.sh`)
- Fichiers a generer (noms pour `files.sh`)
- Endpoints API (issus de la spec Notion)
- Schemas Mongoose (champs, types, refs)
- DTOs class-validator (champs, decorateurs)
- Entities (getters/setters)
- Modifications de `app.module.ts`

**Si `--plan` est actif** : Affiche ce plan a l'utilisateur et **STOP**. N'execute pas les etapes suivantes.

---

### Etape 3 — Scaffolder

Lis et suis les instructions de `.claude/agents/scaffolder.md`.

**Objectif** : Creer la structure de fichiers en utilisant les scripts `feature.sh` et `files.sh`.

**Livrable** : Arborescence complete des features avec tous les fichiers de base generes.

---

### Etape 4 — Implementer

Lis et suis les instructions de `.claude/agents/implementer.md`.

**Objectif** : Ecrire le code fonctionnel complet de chaque fichier genere.

**Livrable** : Code complet pour :

- Schemas Mongoose (champs @Prop)
- Entities (getters/setters)
- DTOs (class-validator + @ApiProperty)
- Mappers (Document → Entity)
- Repository interfaces + implementations
- Service interfaces + implementations
- Controllers (CRUD + Swagger decorators)
- Feature modules (DI bindings)
- AppModule (import du feature module)

---

### Etape 5 — Quality Checker

Lis et suis les instructions de `.claude/agents/quality-checker.md`.

**Objectif** : Verifier que le code compile et respecte les conventions.

**Livrable** : Tous les checks passent :

- `npx nest build` → 0 erreur
- `npm run lint` → 0 erreur
- Verifications manuelles (DI tokens, Swagger, imports)
- Corriger les erreurs si besoin (max 3 iterations de fix)

---

### Etape 6 — Git Ops

Lis et suis les instructions de `.claude/agents/git-ops.md`.

**Objectif** : Commit, push et mettre a jour Notion.

**Livrable** :

- Commit avec message `feat(US-{numero}): {description courte}`
- Push sur la branche courante
- Mettre le **`Statut Back`** de la US a **"Fait"** dans Notion
