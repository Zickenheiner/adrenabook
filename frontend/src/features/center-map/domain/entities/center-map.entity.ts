export interface CenterMapItemEntity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  activitiesCount: number;
}

export interface CentersMapEntity {
  centers: CenterMapItemEntity[];
}
