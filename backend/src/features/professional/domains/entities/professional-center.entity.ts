import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { ProfessionalCenter } from '../schemas/professional-center.schema';

export class ProfessionalCenterEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the professional center',
  })
  private readonly id: ProfessionalCenter;

  private ownerId: mongoose.Types.ObjectId;
  private companyName: string;
  private siret: string;
  private contactEmail: string;
  private contactPhone: string;
  private address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  private legalRepresentative: {
    firstName: string;
    lastName: string;
    role: string;
  };
  private documents: {
    kbisFileId: string;
    rcProFileId: string;
    instructorDiplomas: string[];
  };
  private status: string;

  constructor(_id: ProfessionalCenter) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): ProfessionalCenter {
    return this.id;
  }

  getOwnerId(): mongoose.Types.ObjectId {
    return this.ownerId;
  }

  getCompanyName(): string {
    return this.companyName;
  }

  getSiret(): string {
    return this.siret;
  }

  getContactEmail(): string {
    return this.contactEmail;
  }

  getContactPhone(): string {
    return this.contactPhone;
  }

  getAddress(): {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  } {
    return this.address;
  }

  getLegalRepresentative(): {
    firstName: string;
    lastName: string;
    role: string;
  } {
    return this.legalRepresentative;
  }

  getDocuments(): {
    kbisFileId: string;
    rcProFileId: string;
    instructorDiplomas: string[];
  } {
    return this.documents;
  }

  getStatus(): string {
    return this.status;
  }

  // ———————SETTER———————

  setOwnerId(value: mongoose.Types.ObjectId): void {
    this.ownerId = value;
  }

  setCompanyName(value: string): void {
    this.companyName = value;
  }

  setSiret(value: string): void {
    this.siret = value;
  }

  setContactEmail(value: string): void {
    this.contactEmail = value;
  }

  setContactPhone(value: string): void {
    this.contactPhone = value;
  }

  setAddress(value: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  }): void {
    this.address = value;
  }

  setLegalRepresentative(value: {
    firstName: string;
    lastName: string;
    role: string;
  }): void {
    this.legalRepresentative = value;
  }

  setDocuments(value: {
    kbisFileId: string;
    rcProFileId: string;
    instructorDiplomas: string[];
  }): void {
    this.documents = value;
  }

  setStatus(value: string): void {
    this.status = value;
  }
}
