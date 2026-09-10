export interface CentersMapQueryDto {
  lat?: number;
  lng?: number;
  radius?: number;
  type?: string;
}

export interface CenterMapItemDto {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  activitiesCount: number;
}

export interface CentersMapResponseDto {
  centers: CenterMapItemDto[];
}
