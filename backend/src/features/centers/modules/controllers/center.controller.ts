import {
  CenterDetailResponseDto,
  CentersListResponseDto,
  CentersMapQueryDto,
  CentersMapResponseDto,
  CentersQueryDto,
} from '@features/centers/domains/dtos/center.dto';
import { ICenterService } from '@features/centers/interfaces/services/center.iservice';
import { Public } from '@core/decorators/public.decorator';
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('centers')
export class CenterController {
  constructor(
    @Inject('ICenterService')
    private readonly centerService: ICenterService,
  ) {}

  @Public()
  @ApiOperation({
    summary: 'Get centers for interactive map',
    description:
      'Returns centers within a bounding box, with optional activity type filter and clustering based on zoom level',
  })
  @ApiQuery({
    name: 'bbox',
    required: true,
    description: "Bounding box in format 'minLng,minLat,maxLng,maxLat'",
    example: '2.2,48.8,2.4,48.9',
  })
  @ApiQuery({
    name: 'activityType',
    required: false,
    description: 'Filter by activity type',
    example: 'escalade',
  })
  @ApiQuery({
    name: 'zoom',
    required: true,
    description: 'Current map zoom level',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Centers returned',
    type: CentersMapResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Malformed bounding box',
  })
  @Get('map')
  async getMap(
    @Query() query: CentersMapQueryDto,
  ): Promise<CentersMapResponseDto> {
    return this.centerService.getMap(query);
  }

  @Public()
  @ApiOperation({
    summary: 'Get centers for interactive map (by lat/lng/radius)',
    description:
      'Returns centers filtered by geolocation and optional activity type. All params are optional — if omitted, returns all centers.',
  })
  @ApiQuery({
    name: 'lat',
    required: false,
    description: 'Latitude of the search origin',
    example: 45.764,
  })
  @ApiQuery({
    name: 'lng',
    required: false,
    description: 'Longitude of the search origin',
    example: 4.8357,
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    description: 'Search radius in kilometers',
    example: 50,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by activity type',
    example: 'escalade',
  })
  @ApiResponse({
    status: 200,
    description: 'List of centers',
    type: CentersListResponseDto,
  })
  @Get()
  async getCenters(
    @Query() query: CentersQueryDto,
  ): Promise<CentersListResponseDto> {
    return this.centerService.getCenters(query);
  }

  @Public()
  @ApiOperation({
    summary: 'Public profile of a center',
    description:
      'Returns the identity of an approved center and the published activities it offers. The application data (SIRET number, legal representative, supporting documents) is not exposed.',
  })
  @ApiParam({ name: 'id', description: 'Center identifier', type: String })
  @ApiResponse({
    status: 200,
    description: 'Center profile',
    type: CenterDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Center not found' })
  @Get(':id')
  async getCenterDetail(
    @Param('id') id: string,
  ): Promise<CenterDetailResponseDto> {
    return this.centerService.getCenterDetail(id);
  }
}
