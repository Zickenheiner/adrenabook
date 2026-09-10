import { ApiProperty } from '@nestjs/swagger';
import { Activity } from '../schemas/activity.schema';
import mongoose from 'mongoose';

export class ActivityEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the activity',
  })
  private readonly id: Activity;

  private title: string;
  private description: string;
  private type: string;
  private difficulty: string;
  private durationMinutes: number;
  private priceFromEur: number;
  private prerequisites: {
    minAge: number;
    maxAge?: number;
    minWeightKg?: number;
    maxWeightKg?: number;
    medicalCertificateRequired: boolean;
  };
  private includedEquipment: string[];
  private photoFileIds: string[];
  private status: string;
  private centerId: mongoose.Types.ObjectId;
  private createdAt: Date;

  constructor(_id: Activity) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): Activity {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getType(): string {
    return this.type;
  }

  getDifficulty(): string {
    return this.difficulty;
  }

  getDurationMinutes(): number {
    return this.durationMinutes;
  }

  getPriceFromEur(): number {
    return this.priceFromEur;
  }

  getPrerequisites(): {
    minAge: number;
    maxAge?: number;
    minWeightKg?: number;
    maxWeightKg?: number;
    medicalCertificateRequired: boolean;
  } {
    return this.prerequisites;
  }

  getIncludedEquipment(): string[] {
    return this.includedEquipment;
  }

  getPhotoFileIds(): string[] {
    return this.photoFileIds;
  }

  getStatus(): string {
    return this.status;
  }

  getCenterId(): mongoose.Types.ObjectId {
    return this.centerId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  // ———————SETTER———————

  setTitle(value: string): void {
    this.title = value;
  }

  setDescription(value: string): void {
    this.description = value;
  }

  setType(value: string): void {
    this.type = value;
  }

  setDifficulty(value: string): void {
    this.difficulty = value;
  }

  setDurationMinutes(value: number): void {
    this.durationMinutes = value;
  }

  setPriceFromEur(value: number): void {
    this.priceFromEur = value;
  }

  setPrerequisites(value: {
    minAge: number;
    maxAge?: number;
    minWeightKg?: number;
    maxWeightKg?: number;
    medicalCertificateRequired: boolean;
  }): void {
    this.prerequisites = value;
  }

  setIncludedEquipment(value: string[]): void {
    this.includedEquipment = value;
  }

  setPhotoFileIds(value: string[]): void {
    this.photoFileIds = value;
  }

  setStatus(value: string): void {
    this.status = value;
  }

  setCenterId(value: mongoose.Types.ObjectId): void {
    this.centerId = value;
  }

  setCreatedAt(value: Date): void {
    this.createdAt = value;
  }
}
