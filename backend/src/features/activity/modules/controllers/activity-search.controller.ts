import {
  ActivityDetailResponseDto,
  ActivityMonthSlotsResponseDto,
  SearchActivitiesQueryDto,
  SearchActivitiesResponseDto,
} from '@features/activity/domains/dtos/activity.dto';
import { IActivityService } from '@features/activity/interfaces/services/activity.iservice';
import { Public } from '@core/decorators/public.decorator';
import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { IUploadService } from '@features/uploads/interfaces/services/upload.iservice';

@ApiTags('Activities — Search')
@Controller('activities')
export class ActivitySearchController {
  constructor(
    @Inject('IActivityService')
    private readonly activityService: IActivityService,
    @Inject('IUploadService')
    private readonly uploadService: IUploadService,
  ) {}

  @Public()
  @ApiOperation({
    summary: 'Rechercher des activités avec filtres (US-06)',
    description:
      'Recherche publique des activités publiées avec filtres multi-critères (type, prix, difficulté, texte libre). Pagination 20 résultats par page, tri par pertinence/prix.',
  })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: [
      'bungee',
      'climbing',
      'diving',
      'paragliding',
      'canyoning',
      'via_ferrata',
    ],
  })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'radiusKm', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['relevance', 'price_asc', 'price_desc', 'distance'],
  })
  @ApiResponse({
    status: 200,
    description: 'Résultats de la recherche',
    type: SearchActivitiesResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @Get('search')
  async search(
    @Query() query: SearchActivitiesQueryDto,
  ): Promise<SearchActivitiesResponseDto> {
    return this.activityService.search(query);
  }

  @Public()
  @ApiOperation({
    summary: "Photo publique d'une activité",
    description:
      'Sert une image sans authentification, uniquement si une activité publiée la référence. Les autres fichiers du dépôt (justificatifs KYC) restent protégés par GET /uploads/:id.',
  })
  @ApiParam({ name: 'fileId', description: 'Identifiant du fichier' })
  @ApiResponse({ status: 200, description: "Contenu de l'image" })
  @ApiResponse({ status: 404, description: 'Photo introuvable' })
  @Get('photos/:fileId')
  async photo(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = (await this.activityService.isPublicPhoto(fileId))
      ? await this.uploadService.findPublicById(fileId)
      : null;

    // Un fichier non reference par une activite publiee est traite comme
    // absent : repondre 403 revelerait son existence au depot.
    if (!file) {
      throw new NotFoundException('Photo introuvable');
    }

    res.setHeader('Content-Type', file.getMimeType());
    res.setHeader('Content-Length', file.getSizeBytes());
    res.setHeader('Cache-Control', 'public, max-age=3600');

    this.uploadService.openDownloadStream(fileId).pipe(res);
  }

  @Public()
  @ApiOperation({
    summary: "Fiche détaillée d'une activité (US-07)",
    description:
      "Retourne la fiche complète d'une activité publiée : galerie photos/vidéos, description, prérequis, équipement fourni, créneaux disponibles sur 90 jours, résumé des avis vérifiés.",
  })
  @ApiParam({
    name: 'id',
    description: "L'identifiant de l'activité",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Fiche détaillée de l'activité",
    type: ActivityDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Activité introuvable ou désactivée',
  })
  @Public()
  @ApiOperation({
    summary: "Creneaux d'une activite pour un mois donne (US-07)",
    description:
      'Retourne les creneaux du mois demande et la liste des mois a venir qui ' +
      'en comportent. Charger un mois a la fois evite de transmettre une annee ' +
      'entiere de creneaux pour une recurrence longue.',
  })
  @ApiParam({
    name: 'id',
    description: "L'identifiant de l'activite",
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'month',
    description: 'Mois vise au format YYYY-MM. Par defaut : le mois courant.',
    required: false,
    example: '2026-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Creneaux du mois et mois disponibles',
    type: ActivityMonthSlotsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Mois malforme' })
  @ApiResponse({ status: 404, description: 'Activite introuvable' })
  @Get(':id/slots')
  async findSlotsByMonth(
    @Param('id') id: string,
    @Query('month') month?: string,
  ): Promise<ActivityMonthSlotsResponseDto> {
    const target = month ?? new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(target)) {
      throw new BadRequestException('Mois attendu au format YYYY-MM');
    }

    const slots = await this.activityService.findSlotsByMonth(id, target);
    if (!slots) {
      throw new NotFoundException('Activite introuvable ou desactivee');
    }
    return slots;
  }

  @Get(':id')
  async findDetail(
    @Param('id') id: string,
  ): Promise<ActivityDetailResponseDto> {
    const detail = await this.activityService.findDetailById(id);
    if (!detail) {
      throw new NotFoundException('Activité introuvable ou désactivée');
    }
    return detail;
  }
}
