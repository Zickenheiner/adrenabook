import {
  CreateProfessionalCenterDto,
  UpdateProfessionalCenterDto,
} from '@features/professional/domains/dtos/professional-center.dto';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';
import { IProfessionalCenterService } from '@features/professional/interfaces/services/professional-center.iservice';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Patch,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('professional-center')
export class ProfessionalCenterController {
  constructor(
    @Inject('IProfessionalCenterService')
    private readonly professionalCenterService: IProfessionalCenterService,
  ) {}

  @ApiOperation({
    summary: 'Get all professional-centers',
    description: 'Retrieve a list of all professional-centers',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all professional-centers',
    type: [ProfessionalCenterEntity],
  })
  @Get()
  async findAll() {
    return this.professionalCenterService.findAll();
  }

  @ApiOperation({
    summary: 'Get professional-center by id',
    description: 'Retrieve a professional-center by its id',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the professional-center to retrieve',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The professional-center with the given id',
    type: ProfessionalCenterEntity,
  })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.professionalCenterService.findById(id);
  }

  @ApiOperation({
    summary: 'Create professional-center',
    description: 'Create a new professional-center',
  })
  @ApiBody({
    type: CreateProfessionalCenterDto,
    description: 'The data to create a new professional-center',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'The created professional-center',
    type: Boolean,
  })
  @Post()
  async create(@Body() dto: CreateProfessionalCenterDto) {
    return this.professionalCenterService.create(dto);
  }

  @ApiOperation({
    summary: 'Update professional-center',
    description: 'Update a professional-center',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the professional-center to update',
    required: true,
    type: String,
  })
  @ApiBody({
    type: UpdateProfessionalCenterDto,
    description: 'The updated professional-center data',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'The updated professional-center',
    type: Boolean,
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProfessionalCenterDto,
  ) {
    return this.professionalCenterService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete professional-center',
    description: 'Delete a professional-center',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the professional-center to delete',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The deleted professional-center',
    type: Boolean,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.professionalCenterService.delete(id);
  }
}
