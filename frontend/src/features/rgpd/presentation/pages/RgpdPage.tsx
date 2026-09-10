import { motion } from 'motion/react';
import { Separator } from '@/core/components/ui/separator';
import { Shield } from 'lucide-react';
import {
  useRequestRgpdDelete,
  useRequestRgpdExport,
} from '../../domain/hooks/rgpd.hook';
import RgpdExportSection from '../components/RgpdExportSection';
import RgpdDeleteSection from '../components/RgpdDeleteSection';
import type { RgpdDeleteFormData } from '../../domain/schemas/rgpd.schema';

export default function RgpdPage() {
  const {
    requestExport,
    requestExportIsPending,
    requestExportError,
    exportData,
  } = useRequestRgpdExport();

  const {
    requestDelete,
    requestDeleteIsPending,
    requestDeleteError,
    deleteData,
  } = useRequestRgpdDelete();

  function handleRequestExport() {
    requestExport();
  }

  function handleRequestDelete(data: RgpdDeleteFormData) {
    requestDelete(data);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Mes droits RGPD
              </h1>
              <p className="text-sm text-muted-foreground">
                Gérez vos données personnelles conformément au Règlement Général
                sur la Protection des Données.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          <RgpdExportSection
            onRequestExport={handleRequestExport}
            isPending={requestExportIsPending}
            exportData={exportData}
            error={requestExportError}
          />

          <RgpdDeleteSection
            onRequestDelete={handleRequestDelete}
            isPending={requestDeleteIsPending}
            deleteData={deleteData}
            error={requestDeleteError}
          />
        </div>
      </motion.div>
    </div>
  );
}
