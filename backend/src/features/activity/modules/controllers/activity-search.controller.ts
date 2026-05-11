import {
  SearchActivitiesQueryDto,
  SearchActivitiesResponseDto,
} from '@features/activity/domains/dtos/activity.dto';
import { IActivityService } from '@features/activity/interfaces/services/activity.iservice';
import { Public } from '@core/decorators/public.decorator';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Activities — Search')
@Controller('activities')
export class ActivitySearchController {
  constructor(
    @Inject('IActivityService')
    private readonly activityService: IActivityService,
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
}
