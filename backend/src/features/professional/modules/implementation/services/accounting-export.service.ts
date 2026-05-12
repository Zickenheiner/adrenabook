import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IAccountingExportService } from '../../../interfaces/services/accounting-export.iservice';
import { IAccountingExportRepository } from '@features/professional/interfaces/repositories/accounting-export.irepository';
import {
  AccountingExportResponseDto,
  CreateAccountingExportDto,
} from '@features/professional/domains/dtos/accounting-export.dto';

@Injectable()
export class AccountingExportService implements IAccountingExportService {
  constructor(
    @Inject('IAccountingExportRepository')
    private readonly accountingExportRepository: IAccountingExportRepository,
  ) {}

  async createExport(
    dto: CreateAccountingExportDto,
    professionalId: string,
    professionalEmail: string,
  ): Promise<AccountingExportResponseDto> {
    const from = new Date(dto.from);
    const to = new Date(dto.to);

    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from >= to) {
      throw new BadRequestException('Invalid date range');
    }

    const entity = await this.accountingExportRepository.create(
      dto,
      professionalId,
    );

    const response: AccountingExportResponseDto = {
      exportJobId: entity.getId(),
      status: entity.getStatus() as 'ready' | 'queued',
      recordsCount: entity.getRecordsCount(),
    };

    if (dto.deliveryMode === 'email') {
      response.emailDeliveredTo = professionalEmail;
    } else {
      response.downloadUrl = entity.getDownloadUrl();
    }

    return response;
  }
}
