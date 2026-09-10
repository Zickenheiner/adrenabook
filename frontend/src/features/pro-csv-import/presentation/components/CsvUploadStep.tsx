import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import { Label } from '@/core/components/ui/label';
import { cn } from '@/core/utils/cn';

export type EntityType = 'slots' | 'customers' | 'activities';

interface Props {
  onNext: (entityType: EntityType, fileId: string, fileName: string) => void;
}

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  slots: 'Créneaux',
  customers: 'Clients',
  activities: 'Activités',
};

export default function CsvUploadStep({ onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [entityType, setEntityType] = useState<EntityType | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith('.csv')) return;
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleNext = () => {
    if (!entityType || !selectedFile) return;
    const simulatedFileId = `file_${Date.now()}`;
    onNext(entityType, simulatedFileId, selectedFile.name);
  };

  const isValid = !!entityType && !!selectedFile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="entity-type">Type de données à importer</Label>
        <Select
          value={entityType}
          onValueChange={(v) => setEntityType(v as EntityType)}
        >
          <SelectTrigger id="entity-type" className="w-full">
            <SelectValue placeholder="Choisir le type d'entité..." />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ENTITY_TYPE_LABELS) as EntityType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {ENTITY_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fichier CSV</Label>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/30 hover:border-primary/60',
          )}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">
              Glissez votre fichier ici ou{' '}
              <span className="text-primary underline">parcourir</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Uniquement .csv — 10 Mo max
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />
        </div>

        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2"
          >
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 truncate text-sm">{selectedFile.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Retirer le fichier"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!isValid}>
          Suivant — Mapping des colonnes
        </Button>
      </div>
    </motion.div>
  );
}
