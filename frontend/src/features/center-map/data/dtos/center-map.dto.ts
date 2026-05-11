export interface CentersMapQueryDto {
  bbox: string; // format 'minLng,minLat,maxLng,maxLat'
  activityType?: string;
  zoom: number;
}

export interface CenterMapItemDto {
  id: string;
  name: string;
  lat: number;
  lng: number;
  activitiesCount: number;
  cluster?: boolean;
  clusterSize?: number;
}

export interface CentersMapResponseDto {
  centers: CenterMapItemDto[];
}
