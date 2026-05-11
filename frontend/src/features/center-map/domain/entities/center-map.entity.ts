export interface CenterMapItemEntity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  activitiesCount: number;
  cluster: boolean;
  clusterSize?: number;
}

export interface CentersMapEntity {
  centers: CenterMapItemEntity[];
}
