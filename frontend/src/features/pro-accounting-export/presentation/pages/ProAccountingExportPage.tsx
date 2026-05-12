import { AlertCircle, FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';
import { useCreateAccountingExport } from '../../domain/hooks/accounting-export.hook';
import type { AccountingExportFormData } from '../../domain/schemas/accounting-export.schema';
import AccountingExportForm from '../components/AccountingExportForm';
import ExportResultCard from '../components/ExportResultCard';
import { Alert, AlertDescription, AlertTitle } from '@/core/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Skeleton } from '@/core/components/ui/skeleton';

function ProAccountingExportSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80" />
      <div className="space-y-4 mt-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default function ProAccountingExportPage() {
  const {
    createAccountingExport,
    createAccountingExportIsPending,
    createAccountingExportError,
    accountingExportResult,
    resetAccountingExport,
  } = useCreateAccountingExport();

  const handleSubmit = (data: AccountingExportFormData) => {
    createAccountingExport({
      format: data.format,
      from: data.from,
      to: data.to,
      includeRefunds: data.includeRefunds,
      deliveryMode: data.deliveryMode,
    });
  };

  if (createAccountingExportIsPending) {
    return <ProAccountingExportSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* En-tête */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Export comptable</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Exportez vos données de ventes au format Sage ou CSV pour votre expert-comptable.
            </p>
          </div>
        </div>

        {/* Erreur */}
        {createAccountingExportError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur lors de l&apos;export</AlertTitle>
              <AlertDescription>
                Une erreur est survenue lors de la génération de l&apos;export. Veuillez vérifier la période sélectionnée et réessayer.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Résultat ou Formulaire */}
        {accountingExportResult ? (
          <ExportResultCard result={accountingExportResult} onReset={resetAccountingExport} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paramètres de l&apos;export</CardTitle>
              <CardDescription>
                Configurez la période, le format et le mode de livraison de votre export.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountingExportForm
                onSubmit={handleSubmit}
                isPending={createAccountingExportIsPending}
              />
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
