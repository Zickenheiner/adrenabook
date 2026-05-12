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
  onNext: (columnMapping: Record<string, string>) => void;
  onBack: () => void;
}

const TARGET_FIELDS: Record<EntityType, { key: string; label: string }[]> = {
  slots: [
    { key: 'title', label: 'Titre' },
    { key: 'startDate', label: 'Date de début' },
    { key: 'endDate', label: 'Date de fin' },
    { key: 'capacity', label: 'Capacité' },
    { key: 'price', label: 'Prix (€)' },
  ],
  customers: [
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
  ],
  activities: [
    { key: 'name', label: 'Nom' },
    { key: 'description', label: 'Description' },
    { key: 'duration', label: 'Durée (min)' },
    { key: 'difficulty', label: 'Difficulté' },
  ],
};

// Simulate CSV column names detected from the file
const MOCK_CSV_COLUMNS = [
  'Colonne A',
  'Colonne B',
  'Colonne C',
  'Colonne D',
  'Colonne E',
];

export default function ColumnMappingStep({
  entityType,
  fileName,
  onNext,
  onBack,
}: Props) {
  const fields = TARGET_FIELDS[entityType];
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const handleMapping = (targetKey: string, csvColumn: string) => {
    setMapping((prev) => ({ ...prev, [targetKey]: csvColumn }));
  };

  const mappedCount = Object.keys(mapping).filter((k) => mapping[k]).length;
  const isValid = mappedCount >= 1;

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
                  {MOCK_CSV_COLUMNS.map((col) => (
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
