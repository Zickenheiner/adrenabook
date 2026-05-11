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
import type { PendingCenterEntity } from '../../domain/entities/center-review.entity';

interface Props {
  center: PendingCenterEntity;
  index?: number;
}

export default function CenterReviewCard({ center, index = 0 }: Props) {
  const documents = [
    { label: 'Extrait Kbis', url: center.kbisUrl },
    { label: 'Diplôme instructeur', url: center.diplomaUrl },
    { label: 'Attestation assurance', url: center.insuranceUrl },
  ].filter((doc) => !!doc.url);

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

          {center.description && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground line-clamp-3">
                {center.description}
              </p>
            </>
          )}

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
                      key={doc.label}
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      asChild
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-3 w-3" />
                        {doc.label}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
