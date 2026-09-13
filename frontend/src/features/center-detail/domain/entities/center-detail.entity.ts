export interface CenterActivityEntity {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  durationMinutes: number;
  priceEur: number;
  coverPhotoUrl: string;
}

export interface CenterDetailEntity {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  activities: CenterActivityEntity[];
}
