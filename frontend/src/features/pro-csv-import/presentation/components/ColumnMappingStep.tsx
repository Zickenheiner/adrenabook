import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import type { EntityType } from './CsvUploadStep';

interface Props {
  entityType: EntityType;
  fileName: string;
  /** En-tetes lues dans le fichier depose. */
  columns: string[];
  onNext: (columnMapping: Record<string, string>) => void;
  onBack: () => void;
}

const TARGET_FIELDS: Record<
  EntityType,
  { key: string; label: string; required: boolean }[]
> = {
  // La duree et le prix sont ceux de l'activite : un creneau ne peut pas les
  // contredire, le fichier n'a donc pas a les porter.
  slots: [
    { key: 'activityTitle', label: "Titre de l'activité", required: true },
    { key: 'startAt', label: 'Date et heure de début', required: true },
    { key: 'maxParticipants', label: 'Participants max', required: true },
  ],
  activities: [
    { key: 'title', label: 'Titre', required: true },
    { key: 'description', label: 'Description', required: true },
    { key: 'type', label: "Type d'activité", required: true },
    {
      key: 'difficulty',
      label: 'Difficulté (beginner, intermediate, advanced)',
      required: true,
    },
    { key: 'durationMinutes', label: 'Durée (min)', required: true },
    { key: 'priceEur', label: 'Prix (€)', required: true },
  ],
};

export default function ColumnMappingStep({
  entityType,
  fileName,
  columns,
  onNext,
  onBack,
}: Props) {
  const fields = TARGET_FIELDS[entityType];
  const [mapping, setMapping] = useState<Record<string, string>>(() =>
    // Une colonne portant le nom du champ cible est associee d'office : les
    // fichiers issus d'un export precedent tombent juste sans rien saisir.
    Object.fromEntries(
      fields
        .map((field) => [
          field.key,
          columns.find(
            (column) => column.toLowerCase() === field.label.toLowerCase(),
          ) ?? '',
        ])
        .filter(([, column]) => column),
    ),
  );

  const handleMapping = (targetKey: string, csvColumn: string) => {
    setMapping((prev) => ({ ...prev, [targetKey]: csvColumn }));
  };

  const mappedCount = Object.keys(mapping).filter((k) => mapping[k]).length;
  // Une colonne requise non associee ferait echouer toutes les lignes cote
  // API : autant bloquer ici.
  const isValid = fields
    .filter((field) => field.required)
    .every((field) => !!mapping[field.key]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Fichier :{' '}
        <span className="font-medium text-foreground">{fileName}</span>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Associez chaque champ cible à la colonne correspondante de votre
          fichier CSV.
        </p>

        <div className="space-y-3">
          {fields.map((field) => (
            <div
              key={field.key}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
            >
              <div className="rounded-md border bg-background px-3 py-2 text-sm font-medium">
                {field.label}
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Select
                value={mapping[field.key] ?? ''}
                onValueChange={(v) => handleMapping(field.key, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Colonne CSV..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ignore__">— Ignorer —</SelectItem>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {mappedCount} / {fields.length} champ(s) mappé(s)
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={() => onNext(mapping)} disabled={!isValid}>
          Suivant — Prévisualisation
        </Button>
      </div>
    </motion.div>
  );
}
