import { ACCESSIBILITY_DECLARATION as declaration } from '../../domain/accessibility-declaration';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Déclaration d'accessibilité
          </h1>
          <p className="text-muted-foreground">
            Établie le {formatDate(declaration.lastAuditDate)}.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Engagement</h2>
          <p className="text-muted-foreground">
            AdrenaBook s'engage à rendre sa plateforme accessible conformément
            au Référentiel Général d'Amélioration de l'Accessibilité (RGAA),
            niveau {declaration.rgaaLevel}. Cette déclaration s'applique à
            l'ensemble du site adrenabook.fr.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. État de conformité</h2>
          <p className="text-muted-foreground">
            AdrenaBook est{' '}
            <strong className="text-foreground">
              {declaration.conformityState}
            </strong>{' '}
            au RGAA niveau {declaration.rgaaLevel}. Cet état signifie que
            certains critères ne sont pas respectés, ou que leur respect n'a pas
            encore été vérifié.
          </p>
          <p className="text-muted-foreground">
            Les pages du périmètre ci-dessous sont contrôlées automatiquement à
            chaque modification du code. Ces contrôles ne couvrent qu'environ un
            tiers des 106 critères du référentiel : les autres relèvent d'un
            audit manuel qui n'a pas été mené à ce jour. Aucun taux de
            conformité RGAA n'est donc annoncé ici, faute de pouvoir l'établir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Périmètre audité</h2>
          <p className="text-muted-foreground">
            Contrôles exécutés sur Chrome, Firefox, Safari et un navigateur
            mobile :
          </p>
          <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
            {declaration.auditedScope.map((page) => (
              <li key={page}>
                <code className="text-sm">{page}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Contenus non accessibles</h2>
          <ul className="space-y-4">
            {declaration.knownNonConformities.map((nc) => (
              <li key={nc.criterion} className="space-y-1">
                <p className="font-medium">{nc.criterion}</p>
                <p className="text-muted-foreground">{nc.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            5. Retour d'information et contact
          </h2>
          <p className="text-muted-foreground">
            Si vous ne parvenez pas à accéder à un contenu ou à un service, vous
            pouvez nous le signaler afin que nous vous orientions vers une
            alternative accessible :{' '}
            <a
              className="underline underline-offset-2 hover:text-foreground"
              href={`mailto:${declaration.contactEmail}`}
            >
              {declaration.contactEmail}
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Voies de recours</h2>
          <p className="text-muted-foreground">
            Si vous constatez un défaut d'accessibilité vous empêchant d'accéder
            à un contenu ou à une fonctionnalité, que vous nous le signalez et
            que vous ne parvenez pas à obtenir une réponse, vous pouvez adresser
            une réclamation au Défenseur des droits, ou saisir son délégué dans
            votre région.
          </p>
        </section>
      </div>
    </div>
  );
}
