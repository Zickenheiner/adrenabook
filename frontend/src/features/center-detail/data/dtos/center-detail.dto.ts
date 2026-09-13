export interface CenterActivityItemDto {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  durationMinutes: number;
  priceEur: number;
  /** Identifiant de fichier, a resoudre via resolvePhotoUrl(). */
  coverPhotoUrl: string;
}

export interface CenterDetailResponseDto {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  activities: CenterActivityItemDto[];
}
