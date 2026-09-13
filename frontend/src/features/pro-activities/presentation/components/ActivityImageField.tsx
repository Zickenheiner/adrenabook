import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { useUploadDocument } from '@/features/uploads/domain/hooks/upload.hook';
import { resolvePhotoUrl } from '@/core/utils/photo-url';

interface Props {
  fileId?: string;
  onChange: (fileId?: string) => void;
}

/** Le depot n'accepte que ces formats, pour 5 Mo au plus. */
const ACCEPTED = 'image/jpeg,image/png';
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function ActivityImageField({ fileId, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadDocument, uploadIsPending } = useUploadDocument();
  const [error, setError] = useState<string | null>(null);
  // Apercu local : l'image envoyee n'est lisible par le navigateur qu'une fois
  // l'activite publiee, l'URL distante ne rendrait donc rien avant.
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ACCEPTED.split(',').includes(file.type)) {
      setError('Formats acceptés : JPEG et PNG.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Fichier trop volumineux (5 Mo maximum).');
      return;
    }

    try {
      const result = await uploadDocument(file);
      setPreview(URL.createObjectURL(file));
      onChange(result.fileId);
    } catch {
      setError("L'envoi de l'image a échoué. Réessayez.");
    }
  };

  const clear = () => {
    setPreview(null);
    setError(null);
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = '';
  };

  const shown = preview ?? resolvePhotoUrl(fileId);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {shown ? (
        <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border bg-muted">
          <img
            src={shown}
            alt="Aperçu de l'activité"
            className="h-full w-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploadIsPending}
            >
              Remplacer
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={clear}
              aria-label="Retirer l'image"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadIsPending}
          className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed"
        >
          {uploadIsPending ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Envoi en cours…</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-sm font-medium">Choisir une image</span>
              <span className="text-xs">JPEG ou PNG, 5 Mo maximum</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
