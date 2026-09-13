import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { IAccountingExportService } from '../../../interfaces/services/accounting-export.iservice';
import { IAccountingExportRepository } from '@features/professional/interfaces/repositories/accounting-export.irepository';
import {
  AccountingExportResponseDto,
  CreateAccountingExportDto,
} from '@features/professional/domains/dtos/accounting-export.dto';
import { IProfessionalCenterService } from '@features/professional/interfaces/services/professional-center.iservice';
import { IUploadService } from '@features/uploads/interfaces/services/upload.iservice';
import { buildAccountingCsv } from '@features/professional/utils/accounting-csv';

@Injectable()
export class AccountingExportService implements IAccountingExportService {
  constructor(
    @Inject('IAccountingExportRepository')
    private readonly accountingExportRepository: IAccountingExportRepository,
    @Inject('IProfessionalCenterService')
    private readonly professionalCenterService: IProfessionalCenterService,
    @Inject('IUploadService')
    private readonly uploadService: IUploadService,
  ) {}

  async createExport(
    dto: CreateAccountingExportDto,
    professionalId: string,
  ): Promise<AccountingExportResponseDto> {
    const from = new Date(dto.from);
    const to = new Date(dto.to);

    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from >= to) {
      throw new BadRequestException('Invalid date range');
    }

    const centers =
      await this.professionalCenterService.findAllByOwnerId(professionalId);
    const centerId =
      dto.centerId ?? (centers.length === 1 ? centers[0].getId() : undefined);
    if (!centerId || !centers.some((center) => center.getId() === centerId)) {
      throw new ForbiddenException(
        'Précisez un centre vous appartenant pour cet export.',
      );
    }

    const entity = await this.accountingExportRepository.create(
      dto,
      professionalId,
    );

    const rows = await this.accountingExportRepository.findAccountingRows(
      centerId,
      from,
      to,
    );

    // Le fichier passe par le depot commun : GET /uploads/:id ne le sert qu'a
    // son deposant, donc au professionnel qui l'a demande.
    const content = Buffer.from(buildAccountingCsv(rows), 'utf8');
    const stored = await this.uploadService.upload(
      {
        originalname: `export-comptable-${dto.from}-${dto.to}.csv`,
        mimetype: 'text/csv',
        size: content.length,
        buffer: content,
      },
      professionalId,
    );

    const downloadUrl = `/uploads/${stored.fileId}`;
    await this.accountingExportRepository.markReady(
      entity.getId(),
      downloadUrl,
      rows.length,
    );

    return {
      exportJobId: entity.getId(),
      status: 'ready',
      recordsCount: rows.length,
      downloadUrl,
    };
  }
}
