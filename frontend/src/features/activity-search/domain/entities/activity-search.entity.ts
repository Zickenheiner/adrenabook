export interface ActivityItemEntity {
  id: string;
  title: string;
  type: string;
  priceFromEur: number;
  durationMinutes: number;
  difficulty: string;
  centerName: string;
  distanceKm?: number;
  rating?: number;
  coverPhotoUrl: string;
}

export interface ActivitySearchResultEntity {
  items: ActivityItemEntity[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ActivitySearchParamsEntity {
  query?: string;
  type?:
    | 'bungee'
    | 'climbing'
    | 'diving'
    | 'paragliding'
    | 'canyoning'
    | 'via_ferrata';
  lat?: number;
  lng?: number;
  radiusKm?: number;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'distance';
}
