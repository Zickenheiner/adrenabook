export default function RgpdLegalPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Politique de confidentialité (RGPD)
          </h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : janvier 2026
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            1. Responsable du traitement
          </h2>
          <p className="text-muted-foreground">
            AdrenaBook SAS, immatriculée au RCS de Paris, est responsable du
            traitement de vos données personnelles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Données collectées</h2>
          <p className="text-muted-foreground">
            Nous collectons les données suivantes : nom, prénom, adresse email,
            date de naissance, données de santé (profil santé optionnel),
            historique de réservations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Finalités du traitement</h2>
          <p className="text-muted-foreground">
            Vos données sont utilisées pour : la gestion de votre compte, le
            traitement des réservations, la personnalisation des suggestions
            d'activités, et la communication relative à vos réservations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Vos droits</h2>
          <p className="text-muted-foreground">
            Conformément au RGPD, vous disposez des droits suivants : accès,
            rectification, effacement, limitation, portabilité et opposition.
            Vous pouvez exercer ces droits depuis votre espace "Mes droits RGPD"
            ou en nous contactant à rgpd@adrenabook.fr.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Conservation des données</h2>
          <p className="text-muted-foreground">
            Vos données sont conservées pendant la durée de votre relation
            contractuelle avec AdrenaBook, augmentée des délais légaux de
            prescription applicables.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Contact DPO</h2>
          <p className="text-muted-foreground">
            Notre Délégué à la Protection des Données (DPO) est joignable à :
            dpo@adrenabook.fr
          </p>
        </section>
      </div>
    </div>
  );
}
