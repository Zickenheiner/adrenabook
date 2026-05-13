import { ApiProperty } from '@nestjs/swagger';
import { Center } from '../schemas/center.schema';

export class CenterEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the center',
  })
  private readonly id: Center;

  private name: string;
  private lat: number;
  private lng: number;
  private city: string;
  private activityTypes: string[];
  private activitiesCount: number;

  constructor(_id: Center) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): Center {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getLat(): number {
    return this.lat;
  }

  getLng(): number {
    return this.lng;
  }

  getCity(): string {
    return this.city;
  }

  getActivityTypes(): string[] {
    return this.activityTypes;
  }

  getActivitiesCount(): number {
    return this.activitiesCount;
  }

  // ———————SETTER———————

  setName(value: string): void {
    this.name = value;
  }

  setLat(value: number): void {
    this.lat = value;
  }

  setLng(value: number): void {
    this.lng = value;
  }

  setCity(value: string): void {
    this.city = value;
  }

  setActivityTypes(value: string[]): void {
    this.activityTypes = value;
  }

  setActivitiesCount(value: number): void {
    this.activitiesCount = value;
  }
}
