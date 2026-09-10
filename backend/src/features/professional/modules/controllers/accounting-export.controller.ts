import { Body, Controller, HttpCode, Inject, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IAccountingExportService } from '@features/professional/interfaces/services/accounting-export.iservice';
import {
  AccountingExportResponseDto,
  CreateAccountingExportDto,
} from '@features/professional/domains/dtos/accounting-export.dto';

@ApiTags('pro-exports')
@ApiBearerAuth()
@Controller('pro/exports')
export class AccountingExportController {
  constructor(
    @Inject('IAccountingExportService')
    private readonly accountingExportService: IAccountingExportService,
  ) {}

  @ApiOperation({
    summary: 'Request an accounting export (Sage / CSV)',
    description:
      'Creates an accounting export for the authenticated professional. Returns a download URL immediately or queues an email delivery for large exports.',
  })
  @ApiBody({
    type: CreateAccountingExportDto,
    description: 'Export parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Export ready for download',
    type: AccountingExportResponseDto,
  })
  @ApiResponse({
    status: 202,
    description: 'Export queued, will be delivered by email',
    type: AccountingExportResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid date range' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Post('accounting')
  @HttpCode(200)
  async createAccountingExport(
    @Body() dto: CreateAccountingExportDto,
    @Req() req: { user: { sub: string; email: string } },
  ): Promise<AccountingExportResponseDto> {
    return this.accountingExportService.createExport(
      dto,
      req.user.sub,
      req.user.email,
    );
  }
}
