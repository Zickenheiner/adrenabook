import { useCallback, useEffect, useState } from 'react';

export type GeolocationStatus =
  'pending' | 'granted' | 'denied' | 'unsupported';

export interface GeolocationPosition {
  lat: number;
  lng: number;
}

/**
 * Position du visiteur, suivie dans la duree.
 *
 * Un refus n'est pas definitif : l'autorisation peut etre accordee apres coup
 * depuis les reglages du navigateur. L'API Permissions previent alors du
 * changement, ce qui evite d'imposer un rechargement de page. Quand elle n'est
 * pas disponible, `retry` laisse reprendre la main manuellement.
 */
export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('pending');

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    setStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      () => setStatus('denied'),
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  useEffect(() => {
    // L'API Permissions est absente de certains navigateurs : son absence
    // degrade l'experience au bouton de reprise, elle ne casse rien.
    if (!navigator.permissions?.query) return;

    let permission: PermissionStatus | null = null;
    let cancelled = false;

    const handleChange = () => {
      if (!permission) return;
      if (permission.state === 'granted') {
        locate();
      } else if (permission.state === 'denied') {
        setPosition(null);
        setStatus('denied');
      }
    };

    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        if (cancelled) return;
        permission = result;
        result.addEventListener('change', handleChange);
      })
      .catch(() => {
        // Requete de permission non supportee : rien a suivre.
      });

    return () => {
      cancelled = true;
      permission?.removeEventListener('change', handleChange);
    };
  }, [locate]);

  return { position, status, retry: locate };
}
