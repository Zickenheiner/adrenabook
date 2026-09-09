import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText,
  ExternalLink,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import UploadApi from '@/features/uploads/data/datasources/upload.api';
import type { PendingCenterEntity } from '../../domain/entities/center-review.entity';

const uploadApi = new UploadApi();

interface Props {
  center: PendingCenterEntity;
  index?: number;
}

export default function CenterReviewCard({ center, index = 0 }: Props) {
  const documents = center.documents;
  const [ouvertureEnCours, setOuvertureEnCours] = useState<string | null>(null);
  const [erreurDocument, setErreurDocument] = useState<string | null>(null);

  /**
   * Ouvre une piece justificative dans un nouvel onglet.
   *
   * Le contenu est recupere avec le jeton d'authentification puis expose en
   * blob local : GET /uploads/:id refuserait un acces non authentifie.
   */
  const ouvrirDocument = async (fileId: string) => {
    setErreurDocument(null);
    setOuvertureEnCours(fileId);
    try {
      const blob = await uploadApi.download(fileId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      // On libere l'URL une fois l'onglet ouvert.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setErreurDocument('Ce document n’a pas pu être ouvert.');
    } finally {
      setOuvertureEnCours(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{center.name}</CardTitle>
                <CardDescription className="text-xs">
                  ID : {center.id}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">
              En attente
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span>{center.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{center.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                Soumis le{' '}
                {new Intl.DateTimeFormat('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }).format(center.submittedAt)}
              </span>
            </div>
          </div>

          <Separator />
          <div className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
            <span>
              SIRET : <span className="font-mono">{center.siret}</span>
            </span>
            <span>Ville : {center.city}</span>
          </div>

          {documents.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Documents fournis
                </p>
                <div className="flex flex-wrap gap-2">
                  {documents.map((doc) => (
                    <Button
                      key={doc.fileId}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      disabled={ouvertureEnCours === doc.fileId}
                      onClick={() => ouvrirDocument(doc.fileId)}
                    >
                      <FileText className="h-3 w-3" />
                      {doc.label}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </Button>
                  ))}
                </div>
                {erreurDocument && (
                  <p className="text-destructive text-xs">{erreurDocument}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
