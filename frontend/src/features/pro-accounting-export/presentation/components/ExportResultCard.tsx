import { useState } from 'react';
import UploadApi from '@/features/uploads/data/datasources/upload.api';
import { CheckCircle, Clock, Download, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { AccountingExportEntity } from '../../domain/entities/accounting-export.entity';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';

interface Props {
  result: AccountingExportEntity;
  onReset: () => void;
}

export default function ExportResultCard({ result, onReset }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    const fileId = result.downloadUrl?.split('/').pop();
    if (!fileId) return;

    setDownloading(true);
    setError(null);
    try {
      const blob = await new UploadApi().download(fileId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'export-comptable.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Le téléchargement a échoué. Réessayez.');
    } finally {
      setDownloading(false);
    }
  };

  const isReady = result.status === 'ready';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isReady ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-amber-500" />
              )}
              Export généré
            </CardTitle>
            <Badge variant={isReady ? 'default' : 'secondary'}>
              {isReady ? 'Prêt' : "En file d'attente"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {result.recordsCount}
            </span>{' '}
            enregistrement{result.recordsCount !== 1 ? 's' : ''} exporté
            {result.recordsCount !== 1 ? 's' : ''}
          </p>

          {isReady && result.downloadUrl && (
            <Button
              className="w-full gap-2"
              disabled={downloading}
              onClick={() => void handleDownload()}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Télécharger l&apos;export
            </Button>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button variant="outline" className="w-full" onClick={onReset}>
            Nouvel export
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
