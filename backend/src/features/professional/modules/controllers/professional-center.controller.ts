import { OwnedCenterDto } from '@features/professional/domains/dtos/professional-center.dto';
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
  Req,
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
    summary: 'List your own centers',
    description:
      'Returns the centers owned by the authenticated user, from the oldest to the most recent, whatever their review status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Centers of the user',
    type: [OwnedCenterDto],
  })
  @Get('mine')
  async findMine(@Req() req: { user: { sub: string } }) {
    return this.professionalCenterService.findOwnedWithActivityCount(
      req.user.sub,
    );
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
  async create(
    @Body() dto: CreateProfessionalCenterDto,
    @Req() req: { user: { sub: string } },
  ) {
    return this.professionalCenterService.create(dto, req.user.sub);
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
  @ApiResponse({ status: 403, description: 'Center not owned by the account' })
  @ApiResponse({ status: 404, description: 'Center not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProfessionalCenterDto,
    @Req() req: { user: { sub: string } },
  ) {
    return this.professionalCenterService.update(id, dto, req.user.sub);
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
  @ApiResponse({ status: 403, description: 'Center not owned by the account' })
  @ApiResponse({ status: 404, description: 'Center not found' })
  @ApiResponse({
    status: 409,
    description: 'The center still holds activities',
  })
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.professionalCenterService.delete(id, req.user.sub);
  }
}
