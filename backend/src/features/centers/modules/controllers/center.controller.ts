import {
  CentersListResponseDto,
  CentersMapQueryDto,
  CentersMapResponseDto,
  CentersQueryDto,
  CreateCenterDto,
  UpdateCenterDto,
} from '@features/centers/domains/dtos/center.dto';
import { CenterEntity } from '@features/centers/domains/entities/center.entity';
import { ICenterService } from '@features/centers/interfaces/services/center.iservice';
import { Public } from '@core/decorators/public.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

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
    description: 'BBox malformée',
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

  @ApiOperation({
    summary: 'Get center by id',
    description: 'Retrieve a center by its id',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the center to retrieve',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The center with the given id',
    type: CenterEntity,
  })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.centerService.findById(id);
  }

  @ApiOperation({
    summary: 'Create center',
    description: 'Create a new center',
  })
  @ApiBody({
    type: CreateCenterDto,
    description: 'The data to create a new center',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'The created center',
    type: Boolean,
  })
  @Post()
  async create(@Body() dto: CreateCenterDto) {
    return this.centerService.create(dto);
  }

  @ApiOperation({
    summary: 'Update center',
    description: 'Update a center',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the center to update',
    required: true,
    type: String,
  })
  @ApiBody({
    type: UpdateCenterDto,
    description: 'The updated center data',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'The updated center',
    type: Boolean,
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCenterDto) {
    return this.centerService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete center',
    description: 'Delete a center',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the center to delete',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The deleted center',
    type: Boolean,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.centerService.delete(id);
  }
}
