import { User, Weight, FileCheck, CheckCircle2, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import type { ActivityDetailPrerequisites } from '../../domain/entities/activity-detail.entity';

interface Props {
  prerequisites: ActivityDetailPrerequisites;
}

interface PrerequisiteRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function PrerequisiteRow({ icon, label, value }: PrerequisiteRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <span className="text-sm text-muted-foreground w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function ActivityPrerequisites({ prerequisites }: Props) {
  const {
    minAge,
    maxAge,
    minWeightKg,
    maxWeightKg,
    medicalCertificateRequired,
  } = prerequisites;

  const ageLabel =
    maxAge != null ? `${minAge} – ${maxAge} ans` : `À partir de ${minAge} ans`;

  const weightParts: string[] = [];
  if (minWeightKg != null) weightParts.push(`min. ${minWeightKg} kg`);
  if (maxWeightKg != null) weightParts.push(`max. ${maxWeightKg} kg`);
  const weightLabel =
    weightParts.length > 0 ? weightParts.join(', ') : 'Aucune restriction';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Prérequis</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/50">
        <PrerequisiteRow
          icon={<User className="h-4 w-4" />}
          label="Âge"
          value={ageLabel}
        />
        <PrerequisiteRow
          icon={<Weight className="h-4 w-4" />}
          label="Poids"
          value={weightLabel}
        />
        <div className="flex items-center gap-3 py-2">
          <div className="text-muted-foreground shrink-0">
            <FileCheck className="h-4 w-4" />
          </div>
          <span className="text-sm text-muted-foreground w-40 shrink-0">
            Certificat médical
          </span>
          {medicalCertificateRequired ? (
            <div className="flex items-center gap-1.5 text-amber-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Requis</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Non requis</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
