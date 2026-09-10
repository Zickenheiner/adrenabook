import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ICsvImportService } from '@features/professional/interfaces/services/csv-import.iservice';
import {
  CsvImportDto,
  CsvImportResponseDto,
} from '@features/professional/domains/dtos/csv-import.dto';

@ApiTags('pro-imports')
@Controller('pro/imports')
export class CsvImportController {
  constructor(
    @Inject('ICsvImportService')
    private readonly csvImportService: ICsvImportService,
  ) {}

  @ApiOperation({
    summary: 'Import CSV file (US-20)',
    description:
      'Launches an asynchronous import job for slots, customers or activities from a previously uploaded CSV file. Supports dry-run mode for validation without persisting data.',
  })
  @ApiBody({
    type: CsvImportDto,
    description:
      'CSV import parameters including entity type, file ID, column mapping and dry-run flag',
    required: true,
  })
  @ApiResponse({
    status: 202,
    description: 'Import job queued successfully',
    type: CsvImportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid column mapping or malformed file',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large (>10 MB)',
  })
  @Post('csv')
  @HttpCode(HttpStatus.ACCEPTED)
  async importCsv(
    @Body() dto: CsvImportDto,
    @Req() req: { user: { sub: string } },
  ): Promise<CsvImportResponseDto> {
    return this.csvImportService.importCsv(dto, req.user.sub);
  }
}
