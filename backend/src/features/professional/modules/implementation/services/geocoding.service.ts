import { Injectable, Logger } from '@nestjs/common';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PostalAddress {
  street: string;
  postalCode: string;
  city: string;
}

const GEOCODING_URL = 'https://api-adresse.data.gouv.fr/search/';
const TIMEOUT_MS = 5000;

/**
 * Convertit une adresse postale en coordonnees via l'API Adresse
 * (api-adresse.data.gouv.fr) : service public, gratuit, sans cle.
 *
 * Le geocodage ne doit jamais faire echouer l'inscription d'un centre : toute
 * erreur (reseau, timeout, adresse introuvable) renvoie null. Le centre est
 * alors enregistre sans coordonnees et n'apparait pas sur la carte, ce qui se
 * rattrape, contrairement a une inscription perdue.
 */
@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  async geocode(address: PostalAddress): Promise<Coordinates | null> {
    const query = [address.street, address.postalCode, address.city]
      .filter((part) => part?.trim())
      .join(' ')
      .trim();

    if (!query) {
      return null;
    }

    try {
      const url = `${GEOCODING_URL}?q=${encodeURIComponent(query)}&limit=1`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.warn(
          `Geocodage indisponible (HTTP ${response.status}) pour « ${query} »`,
        );
        return null;
      }

      const body = (await response.json()) as {
        features?: Array<{ geometry?: { coordinates?: number[] } }>;
      };

      // L'API renvoie les coordonnees en GeoJSON, donc [longitude, latitude].
      const coordinates = body.features?.[0]?.geometry?.coordinates;
      if (!coordinates || coordinates.length < 2) {
        this.logger.warn(`Adresse introuvable : « ${query} »`);
        return null;
      }

      const [lng, lat] = coordinates;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return null;
      }

      return { lat, lng };
    } catch (error) {
      this.logger.warn(
        `Echec du geocodage de « ${query} » : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
