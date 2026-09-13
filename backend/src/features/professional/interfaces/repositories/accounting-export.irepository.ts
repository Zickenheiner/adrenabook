import { AccountingRow } from '@features/professional/utils/accounting-csv';
import { CreateAccountingExportDto } from '@features/professional/domains/dtos/accounting-export.dto';
import { AccountingExportEntity } from '@features/professional/domains/entities/accounting-export.entity';

export interface IAccountingExportRepository {
  create(
    dto: CreateAccountingExportDto,
    professionalId: string,
  ): Promise<AccountingExportEntity>;
  findById(id: string): Promise<AccountingExportEntity | null>;

  /**
   * Reservations d'un centre sur une periode, du plus ancien au plus recent.
   * Les reservations remontent au centre par leur creneau puis leur activite :
   * elles n'en portent pas la reference.
   */
  findAccountingRows(
    centerId: string,
    from: Date,
    to: Date,
    includeRefunds: boolean,
  ): Promise<AccountingRow[]>;

  /** Rattache le fichier genere au job et le marque termine. */
  markReady(
    id: string,
    downloadUrl: string,
    recordsCount: number,
  ): Promise<void>;
}
