import { ApiProperty } from '@nestjs/swagger';
import { User } from '../schemas/user.schema';

export class UserEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the user',
  })
  private readonly id: User;

  private email: string;
  private password: string;
  private firstName: string;
  private lastName: string;
  private birthDate: Date;
  private acceptCgu: boolean;
  private acceptRgpd: boolean;
  private emailVerified: boolean;
  private emailVerificationToken?: string;
  private role: string;

  constructor(_id: User) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): User {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getBirthDate(): Date {
    return this.birthDate;
  }

  getAcceptCgu(): boolean {
    return this.acceptCgu;
  }

  getAcceptRgpd(): boolean {
    return this.acceptRgpd;
  }

  getEmailVerified(): boolean {
    return this.emailVerified;
  }

  getEmailVerificationToken(): string | undefined {
    return this.emailVerificationToken;
  }

  getRole(): string {
    return this.role;
  }

  // ———————SETTER———————

  setEmail(value: string): void {
    this.email = value;
  }

  setPassword(value: string): void {
    this.password = value;
  }

  setFirstName(value: string): void {
    this.firstName = value;
  }

  setLastName(value: string): void {
    this.lastName = value;
  }

  setBirthDate(value: Date): void {
    this.birthDate = value;
  }

  setAcceptCgu(value: boolean): void {
    this.acceptCgu = value;
  }

  setAcceptRgpd(value: boolean): void {
    this.acceptRgpd = value;
  }

  setEmailVerified(value: boolean): void {
    this.emailVerified = value;
  }

  setEmailVerificationToken(value: string | undefined): void {
    this.emailVerificationToken = value;
  }

  setRole(value: string): void {
    this.role = value;
  }
}
