import {
  ActivityResponseDto,
  CreateActivityDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';
import { IActivityService } from '@features/activity/interfaces/services/activity.iservice';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Pro — Activities')
@ApiBearerAuth()
@Controller('pro/activities')
export class ActivityController {
  constructor(
    @Inject('IActivityService')
    private readonly activityService: IActivityService,
  ) {}

  @ApiOperation({
    summary: 'Créer une activité (US-18)',
    description:
      "Crée une nouvelle activité pour le centre du professionnel authentifié. Rôle professionnel requis. Si status='published', l'activité passe en révision admin avant publication.",
  })
  @ApiBody({
    type: CreateActivityDto,
    description: "Données de l'activité à créer",
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Activité créée',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation échouée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Centre non validé par admin' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateActivityDto,
    @Req() req: { user: { sub: string; role: string } },
  ): Promise<ActivityResponseDto> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException(
        'Accès réservé aux professionnels avec un centre validé',
      );
    }
    const result = await this.activityService.create(dto, user.sub);
    if (!result) {
      throw new ForbiddenException(
        "Impossible de créer l'activité. Centre non validé.",
      );
    }
    return result;
  }

  @ApiOperation({
    summary: 'Lister les activités du centre courant',
    description:
      'Retourne toutes les activités du centre du professionnel authentifié.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des activités',
    type: [ActivityEntity],
  })
  @Get('my')
  async findMine(
    @Req() req: { user: { sub: string } },
  ): Promise<ActivityEntity[] | null> {
    return this.activityService.findByCenterId(req.user.sub);
  }

  @ApiOperation({
    summary: 'Récupérer toutes les activités',
    description: 'Retourne toutes les activités (accès admin/interne)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les activités',
    type: [ActivityEntity],
  })
  @Get()
  async findAll(): Promise<ActivityEntity[] | null> {
    return this.activityService.findAll();
  }

  @ApiOperation({
    summary: 'Récupérer une activité par ID',
    description: 'Retourne une activité par son identifiant unique',
  })
  @ApiParam({
    name: 'id',
    description: "L'identifiant de l'activité",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "L'activité demandée",
    type: ActivityEntity,
  })
  @ApiResponse({ status: 404, description: 'Activité introuvable' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ActivityEntity> {
    const activity = await this.activityService.findById(id);
    if (!activity) {
      throw new NotFoundException('Activité introuvable');
    }
    return activity;
  }

  @ApiOperation({
    summary: 'Mettre à jour une activité',
    description:
      "Met à jour les champs d'une activité existante. Rôle professionnel requis.",
  })
  @ApiParam({
    name: 'id',
    description: "L'identifiant de l'activité à mettre à jour",
    required: true,
    type: String,
  })
  @ApiBody({
    type: UpdateActivityDto,
    description: "Les données mises à jour de l'activité",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Activité mise à jour',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Activité introuvable' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
    @Req() req: { user: { sub: string; role: string } },
  ): Promise<boolean> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException('Accès réservé aux professionnels');
    }
    return this.activityService.update(id, dto, user.sub);
  }

  @ApiOperation({
    summary: 'Supprimer une activité',
    description:
      'Supprime définitivement une activité. Rôle professionnel requis.',
  })
  @ApiParam({
    name: 'id',
    description: "L'identifiant de l'activité à supprimer",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Activité supprimée',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Activité introuvable' })
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: { user: { sub: string; role: string } },
  ): Promise<boolean> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException('Accès réservé aux professionnels');
    }
    return this.activityService.delete(id, user.sub);
  }
}
