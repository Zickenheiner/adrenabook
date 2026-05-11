import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import { Button } from '@/core/components/ui/button';
import { CheckCircle2, Download, Hash, Clock } from 'lucide-react';
import type { WaiverEntity } from '../../domain/entities/waiver.entity';

interface Props {
  waiver: WaiverEntity;
}

export default function WaiverSuccessCard({ waiver }: Props) {
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(waiver.signedAt);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <CardTitle className="text-green-800 dark:text-green-200">
                Décharge signée avec succès
              </CardTitle>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Votre signature a été enregistrée et certifiée
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator className="bg-green-200 dark:bg-green-800" />
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Horodatage
                </p>
                <p className="text-sm font-medium">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Hash className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Empreinte SHA-256
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  {waiver.documentHash}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Badge
              variant="outline"
              className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
            >
              eIDAS niveau simple
            </Badge>
            <Badge
              variant="outline"
              className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
            >
              Tamper-proof
            </Badge>
          </div>
          <Button asChild variant="outline" className="w-full" size="sm">
            <a
              href={waiver.downloadUrl}
              download
              target="_blank"
              rel="noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger le document signé
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
