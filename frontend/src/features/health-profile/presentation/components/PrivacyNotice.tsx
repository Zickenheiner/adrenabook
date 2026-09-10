import { ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/core/components/ui/alert';

export default function PrivacyNotice() {
  return (
    <Alert className="border-primary/20 bg-primary/5">
      <ShieldCheck className="h-4 w-4 text-primary" />
      <AlertDescription className="text-sm text-muted-foreground">
        Vos données de santé sont{' '}
        <span className="font-medium text-foreground">chiffrées (AES-256)</span>{' '}
        et strictement confidentielles. Elles ne seront accessibles qu&apos;au
        moniteur encadrant votre activité, le jour même. Vous disposez d&apos;un{' '}
        <span className="font-medium text-foreground">
          droit à l&apos;effacement
        </span>{' '}
        conformément au RGPD.
      </AlertDescription>
    </Alert>
  );
}
