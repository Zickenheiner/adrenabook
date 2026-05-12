import { useState } from 'react';
import { motion } from 'motion/react';
import { FileSpreadsheet } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
import { useCsvImport } from '../../domain/hooks/csv-import.hook';
import CsvUploadStep, { type EntityType } from '../components/CsvUploadStep';
import ColumnMappingStep from '../components/ColumnMappingStep';
import ImportPreviewStep from '../components/ImportPreviewStep';
import ImportResultStep from '../components/ImportResultStep';
import type { CsvImportEntity } from '../../domain/entities/csv-import.entity';
import type { CsvImportRequestDto } from '../../data/dtos/csv-import.dto';

type Step = 'upload' | 'mapping' | 'preview' | 'result';

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Fichier' },
  { key: 'mapping', label: 'Mapping' },
  { key: 'preview', label: 'Prévisualisation' },
  { key: 'result', label: 'Résultat' },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isDone
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                      ? 'border-2 border-primary text-primary'
                      : 'border-2 border-muted text-muted-foreground',
                )}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'hidden sm:block text-xs',
                  isActive
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 mb-4 h-px w-10 sm:w-16 transition-colors',
                  i < currentIndex ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CsvImportPage() {
  const [step, setStep] = useState<Step>('upload');
  const [entityType, setEntityType] = useState<EntityType>('slots');
  const [fileId, setFileId] = useState('');
  const [fileName, setFileName] = useState('');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {},
  );
  const [dryRunResult, setDryRunResult] = useState<CsvImportEntity | null>(
    null,
  );
  const [finalResult, setFinalResult] = useState<CsvImportEntity | null>(null);

  const { importCsvAsync, importIsLoading } = useCsvImport();

  const handleUploadNext = (type: EntityType, fid: string, fname: string) => {
    setEntityType(type);
    setFileId(fid);
    setFileName(fname);
    setStep('mapping');
  };

  const handleMappingNext = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    setStep('preview');
  };

  const handleDryRun = async () => {
    const payload: CsvImportRequestDto = {
      entityType,
      fileId,
      columnMapping,
      dryRun: true,
    };
    const result = await importCsvAsync(payload);
    setDryRunResult(result);
  };

  const handleConfirmImport = async () => {
    const payload: CsvImportRequestDto = {
      entityType,
      fileId,
      columnMapping,
      dryRun: false,
    };
    const result = await importCsvAsync(payload);
    setFinalResult(result);
    setStep('result');
  };

  const handleReset = () => {
    setStep('upload');
    setEntityType('slots');
    setFileId('');
    setFileName('');
    setColumnMapping({});
    setDryRunResult(null);
    setFinalResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      {/* En-tête */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Import CSV</h1>
          <p className="text-sm text-muted-foreground">
            Importez vos données depuis un tableur Excel
          </p>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="mb-8 flex justify-center">
        <StepIndicator current={step} />
      </div>

      {/* Contenu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {step === 'upload' && 'Sélection du fichier'}
            {step === 'mapping' && 'Mapping des colonnes'}
            {step === 'preview' && 'Prévisualisation'}
            {step === 'result' && "Rapport d'import"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'upload' && <CsvUploadStep onNext={handleUploadNext} />}
          {step === 'mapping' && (
            <ColumnMappingStep
              entityType={entityType}
              fileName={fileName}
              onNext={handleMappingNext}
              onBack={() => setStep('upload')}
            />
          )}
          {step === 'preview' && (
            <ImportPreviewStep
              entityType={entityType}
              fileId={fileId}
              columnMapping={columnMapping}
              dryRunResult={dryRunResult}
              isLoading={importIsLoading}
              onRunDryRun={handleDryRun}
              onConfirmImport={handleConfirmImport}
              onBack={() => setStep('mapping')}
            />
          )}
          {step === 'result' && finalResult && (
            <ImportResultStep result={finalResult} onReset={handleReset} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
