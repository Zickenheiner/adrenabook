import { UserEntity } from '@features/auth/domains/entities/user.entity';
import { UserDocument } from '@features/auth/domains/schemas/user.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserMapper {
  toEntity(doc: UserDocument): UserEntity {
    const entity = new UserEntity(doc._id);
    entity.setEmail(doc.email);
    entity.setPassword(doc.password);
    entity.setFirstName(doc.firstName);
    entity.setLastName(doc.lastName);
    entity.setBirthDate(doc.birthDate);
    entity.setAcceptCgu(doc.acceptCgu);
    entity.setAcceptRgpd(doc.acceptRgpd);
    entity.setEmailVerified(doc.emailVerified);
    entity.setEmailVerificationToken(doc.emailVerificationToken);
    entity.setRole(doc.role);
    return entity;
  }
}
