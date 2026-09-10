import { useState } from 'react';
import { LocateFixed, Loader2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';

interface Props {
  onLocate: (lat: number, lng: number) => void;
}

export default function GeolocationButton({ onLocate }: Props) {
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  const handleClick = () => {
    if (!navigator.geolocation) {
      setDenied(true);
      return;
    }
    setLoading(true);
    setDenied(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onLocate(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLoading(false);
        setDenied(true);
      },
    );
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      aria-label="Me géolocaliser"
      title={
        denied
          ? 'Géolocalisation refusée ou indisponible'
          : 'Centrer sur ma position'
      }
      className="shadow-md"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LocateFixed className="h-4 w-4" />
      )}
      <span className="ml-1 hidden sm:inline">
        {denied ? 'Position indisponible' : 'Ma position'}
      </span>
    </Button>
  );
}
