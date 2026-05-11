import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { cn } from '@/core/lib/utils';

interface Props {
  label: string;
  value: string;
  onChange: (fileId: string) => void;
  error?: string;
  accept?: string;
  disabled?: boolean;
}

export default function DocumentUploadField({
  label,
  value,
  onChange,
  error,
  accept = '.pdf,.jpg,.jpeg,.png',
  disabled,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    await new Promise((r) => setTimeout(r, 800));
    const mockFileId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    onChange(mockFileId);
    setIsUploading(false);
  };

  const handleClear = () => {
    onChange('');
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none">{label}</label>
      <div
        className={cn(
          'relative flex items-center gap-3 rounded-md border bg-background px-3 py-2.5 transition-colors',
          error ? 'border-destructive' : 'border-input',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {value ? (
          <>
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 truncate text-sm">
              {fileName || 'Document téléversé'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : isUploading ? (
          <>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            <span className="flex-1 text-sm text-muted-foreground">
              Téléversement en cours…
            </span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-sm text-muted-foreground">
              Cliquez pour sélectionner un fichier
            </span>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
            />
          </>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
