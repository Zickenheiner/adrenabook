import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ICsvImportService } from '@features/professional/interfaces/services/csv-import.iservice';
import { ICsvImportRepository } from '@features/professional/interfaces/repositories/csv-import.irepository';
import {
  CsvImportDto,
  CsvImportResponseDto,
} from '@features/professional/domains/dtos/csv-import.dto';
import { IProfessionalCenterService } from '@features/professional/interfaces/services/professional-center.iservice';
import { IUploadService } from '@features/uploads/interfaces/services/upload.iservice';
import { IActivityService } from '@features/activity/interfaces/services/activity.iservice';
import { ISlotService } from '@features/slot/interfaces/services/slot.iservice';
import { CreateActivityDto } from '@features/activity/domains/dtos/activity.dto';
import { CreateSlotsDto } from '@features/slot/domains/dtos/slot.dto';
import { parseCsv } from '@features/professional/utils/csv-parser';

/**
 * Erreur rattachee a un champ, pour que le rapport d'import designe la colonne
 * fautive et pas seulement la ligne.
 */
class FieldError extends Error {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super(message);
  }
}

interface RowError {
  line: number;
  column: string;
  reason: string;
}

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

/** Accepte la virgule decimale, courante dans les exports de tableurs. */
function toNumber(value: string): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function toDate(value: string): Date | null {
  if (!value?.trim()) return null;
  // Format francais JJ/MM/AAAA [HH:MM], que `new Date()` lit a l'envers.
  const fr = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2}))?$/);
  const date = fr
    ? new Date(
        `${fr[3]}-${fr[2]}-${fr[1]}T${fr[4] ?? '00'}:${fr[5] ?? '00'}:00`,
      )
    : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

@Injectable()
export class CsvImportService implements ICsvImportService {
  constructor(
    @Inject('ICsvImportRepository')
    private readonly csvImportRepository: ICsvImportRepository,
    @Inject('IProfessionalCenterService')
    private readonly professionalCenterService: IProfessionalCenterService,
    @Inject('IUploadService')
    private readonly uploadService: IUploadService,
    @Inject('IActivityService')
    private readonly activityService: IActivityService,
    @Inject('ISlotService')
    private readonly slotService: ISlotService,
  ) {}

  async importCsv(
    dto: CsvImportDto,
    professionalId: string,
  ): Promise<CsvImportResponseDto> {
    if (!dto.columnMapping || Object.keys(dto.columnMapping).length === 0) {
      throw new BadRequestException(
        'Column mapping is required and cannot be empty',
      );
    }
    if (dto.entityType === 'customers') {
      throw new BadRequestException(
        "L'import de clients n'est pas encore disponible.",
      );
    }

    const centers =
      await this.professionalCenterService.findAllByOwnerId(professionalId);
    const centerId =
      dto.centerId ?? (centers.length === 1 ? centers[0].getId() : undefined);
    if (!centerId || !centers.some((center) => center.getId() === centerId)) {
      throw new ForbiddenException(
        'Précisez un centre vous appartenant pour cet import.',
      );
    }

    const rows = await this.readRows(dto.fileId);
    const errors: RowError[] = [];
    let success = 0;

    for (const [index, row] of rows.entries()) {
      // Ligne 1 = en-tetes : la premiere ligne de donnees est la 2.
      const lineNumber = index + 2;
      try {
        if (dto.entityType === 'activities') {
          await this.importActivity(row, dto, centerId, professionalId);
        } else {
          await this.importSlot(row, dto, centerId, professionalId);
        }
        success += 1;
      } catch (error) {
        const field = error instanceof FieldError ? error.field : '';
        errors.push({
          line: lineNumber,
          // On nomme la colonne du fichier, celle que l'utilisateur voit, et
          // non la cle interne a laquelle il l'a associee.
          column: dto.columnMapping[field] ?? field,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const status =
      errors.length === rows.length && rows.length > 0 ? 'failed' : 'completed';

    const importJob = await this.csvImportRepository.create(
      dto,
      professionalId,
      {
        status,
        rowsTotal: rows.length,
        rowsSuccess: success,
        rowsErrors: errors.length,
        errors,
      },
    );

    if (!importJob) {
      throw new BadRequestException('Failed to create import job');
    }

    return {
      importJobId: importJob.getId(),
      status: importJob.getStatus() as
        'queued' | 'processing' | 'completed' | 'failed',
      rowsTotal: importJob.getRowsTotal(),
      rowsSuccess: importJob.getRowsSuccess(),
      rowsErrors: importJob.getRowsErrors(),
      errors: importJob.getErrors(),
    };
  }

  private async readRows(fileId: string): Promise<Record<string, string>[]> {
    const file = await this.uploadService.findPublicById(fileId);
    if (!file) {
      throw new BadRequestException('Fichier introuvable');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of this.uploadService.openDownloadStream(fileId)) {
      chunks.push(Buffer.from(chunk as Buffer));
    }

    const { rows } = parseCsv(Buffer.concat(chunks).toString('utf8'));
    if (rows.length === 0) {
      throw new BadRequestException('Le fichier ne contient aucune ligne.');
    }
    return rows;
  }

  /** Valeur d'une colonne source, d'apres la correspondance choisie. */
  private cell(row: Record<string, string>, column?: string): string {
    return column ? (row[column] ?? '') : '';
  }

  private async importActivity(
    row: Record<string, string>,
    dto: CsvImportDto,
    centerId: string,
    userId: string,
  ): Promise<void> {
    const map = dto.columnMapping;
    const title = this.cell(row, map.title);
    const description = this.cell(row, map.description);
    const type = this.cell(row, map.type);
    const difficulty = this.cell(row, map.difficulty) || 'beginner';
    const duration = toNumber(this.cell(row, map.durationMinutes));
    const price = toNumber(this.cell(row, map.priceEur));

    if (!title) throw new FieldError('title', 'Titre manquant');
    if (!description)
      throw new FieldError('description', 'Description manquante');
    if (!type) throw new FieldError('type', "Type d'activité manquant");
    if (!DIFFICULTIES.includes(difficulty)) {
      throw new FieldError(
        'difficulty',
        `Difficulté « ${difficulty} » inconnue (attendu : ${DIFFICULTIES.join(', ')})`,
      );
    }
    if (duration === null || duration <= 0) {
      throw new FieldError('durationMinutes', 'Durée invalide');
    }
    if (price === null || price < 0)
      throw new FieldError('priceEur', 'Prix invalide');

    // Une simulation valide les lignes sans rien ecrire : c'est tout l'interet
    // de la relire avant de confirmer.
    if (dto.dryRun) return;

    const created = await this.activityService.create(
      {
        title,
        description,
        type,
        difficulty,
        durationMinutes: duration,
        priceEur: price,
        prerequisites: { minAge: 18, medicalCertificateRequired: false },
        includedEquipment: [],
        photoFileIds: [],
        // Importee en brouillon : publier sans relecture exposerait des fiches
        // incompletes au public.
        status: 'unpublished',
      } as unknown as CreateActivityDto,
      userId,
      centerId,
    );
    if (!created) throw new Error("L'activité n'a pas pu être créée");
  }

  private async importSlot(
    row: Record<string, string>,
    dto: CsvImportDto,
    centerId: string,
    userId: string,
  ): Promise<void> {
    const map = dto.columnMapping;
    const activityTitle = this.cell(row, map.activityTitle);
    const startAt = toDate(this.cell(row, map.startAt));
    const capacity = toNumber(this.cell(row, map.maxParticipants));

    if (!activityTitle) {
      throw new FieldError('activityTitle', "Titre d'activité manquant");
    }
    if (!startAt) throw new FieldError('startAt', 'Date de début invalide');
    if (capacity === null || capacity < 1) {
      throw new FieldError(
        'maxParticipants',
        'Nombre de participants invalide',
      );
    }

    // Le creneau se rattache a une activite du centre, designee par son titre :
    // un CSV ne contient pas d'identifiant technique.
    const activities = await this.activityService.findByCenterId(centerId);
    const activity = (activities ?? []).find(
      (item) =>
        item.getTitle()?.trim().toLowerCase() ===
        activityTitle.trim().toLowerCase(),
    );
    if (!activity) {
      throw new FieldError(
        'activityTitle',
        `Aucune activité « ${activityTitle} » dans ce centre`,
      );
    }

    if (dto.dryRun) return;

    // La duree et le prix appartiennent a l'activite, pas au creneau : les
    // redemander dans le fichier permettrait de les contredire.
    const created = await this.slotService.createSlots(
      activity.getId(),
      userId,
      {
        singleStartAt: startAt.toISOString(),
        durationMinutes: activity.getDurationMinutes(),
        maxParticipants: capacity,
        priceEur: activity.getPriceEur(),
        instructorIds: [],
      } as unknown as CreateSlotsDto,
    );
    if (created.createdCount === 0) {
      const conflict = created.conflicts?.length
        ? ' (créneau déjà existant)'
        : '';
      throw new Error(`Le créneau n'a pas pu être créé${conflict}`);
    }
  }
}
