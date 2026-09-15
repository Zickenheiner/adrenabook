import endpoints from '@/core/constants/endpoints';
import { getAccessToken } from '@/core/local/storage';
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { toast } from 'sonner';

interface Props {
  bookingId: string;
  invoiceNumber: string;
}

export default function InvoiceDownloadButton({
  bookingId,
  invoiceNumber,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Le PDF est servi par l'API sous jeton : une URL nue recevrait la page
      // du frontend, enregistree telle quelle en .pdf.
      const token = getAccessToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoints.invoice.pdfByBookingId(bookingId)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (!response.ok) {
        throw new Error('Échec du téléchargement');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Votre facture a été téléchargée avec succès.');
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
