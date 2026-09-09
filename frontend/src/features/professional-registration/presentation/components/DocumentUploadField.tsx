import { useRef, useState } from 'react';
import { FileCheck2, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { cn } from '@/core/utils/cn';
import { ApiError } from '@/core/errors/api.error';
import { useUploadDocument } from '@/features/uploads/domain/hooks/upload.hook';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED = '.pdf,.jpg,.jpeg,.png';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 413) {
      return 'Fichier trop volumineux. Maximum : 5 Mo.';
    }
    if (error.status === 400) {
      return error.message || 'Format de fichier non accepté.';
    }
    return error.message || 'Le dépôt du document a échoué.';
  }
  return 'Le dépôt du document a échoué. Réessayez.';
};

interface Props {
  label: string;
  value: string;
  onChange: (fileId: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Dépôt d'une pièce justificative.
 *
 * Le fichier est réellement téléversé vers POST /uploads, qui renvoie un
 * identifiant. C'est cet identifiant, et non le fichier, que porte le
 * formulaire d'inscription.
 */
export default function DocumentUploadField({
  label,
  value,
  onChange,
  error,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { uploadDocument, uploadIsPending } = useUploadDocument();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // Contrôle côté client pour un retour immédiat ; le backend applique
    // de toute façon la même limite.
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError('Fichier trop volumineux. Maximum : 5 Mo.');
      onChange('');
      return;
    }

    try {
      const uploaded = await uploadDocument(file);
      setFilename(uploaded.filename);
      onChange(uploaded.fileId);
    } catch (err) {
      setLocalError(getErrorMessage(err));
      onChange('');
    }
  };

  const handleClear = () => {
    setFilename('');
    setLocalError(null);
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const messageErreur = localError ?? error;
  const estDepose = value !== '';

  return (
    <div className="space-y-1.5">
      <span className="text-sm leading-none font-medium">{label}</span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploadIsPending}
      />

      <div
        className={cn(
          'flex items-center gap-3 rounded-md border border-dashed px-3 py-2.5',
          messageErreur ? 'border-destructive' : 'border-input',
          estDepose && 'bg-muted/40 border-solid',
        )}
      >
        {uploadIsPending ? (
          <>
            <Loader2
              className="text-muted-foreground h-4 w-4 shrink-0 animate-spin"
              aria-hidden="true"
            />
            <span className="text-muted-foreground flex-1 text-sm">
              Téléversement en cours…
            </span>
          </>
        ) : estDepose ? (
          <>
            <FileCheck2
              className="h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span className="flex-1 truncate text-sm">
              {filename || 'Document déposé'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={disabled}
              aria-label={`Retirer le document : ${label}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Upload
              className="text-muted-foreground h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span className="text-muted-foreground flex-1 text-sm">
              Aucun fichier sélectionné
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              Choisir un fichier
            </Button>
          </>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        PDF, JPEG ou PNG — 5 Mo maximum
      </p>

      {messageErreur && (
        <p className="text-destructive text-xs">{messageErreur}</p>
      )}
    </div>
  );
}
