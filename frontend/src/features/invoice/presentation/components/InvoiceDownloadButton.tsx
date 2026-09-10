import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { toast } from 'sonner';

interface Props {
  downloadUrl: string;
  invoiceNumber: string;
}

export default function InvoiceDownloadButton({
  downloadUrl,
  invoiceNumber,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Échec du téléchargement');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Facture téléchargée avec succès');
    } catch {
      toast.error('Impossible de télécharger la facture. Veuillez réessayer.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-full sm:w-auto"
    >
      {isDownloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isDownloading ? 'Téléchargement...' : 'Télécharger la facture PDF'}
    </Button>
  );
}
