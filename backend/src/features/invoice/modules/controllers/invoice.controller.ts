// Invoice endpoints are exposed via BookingController (GET /bookings/:id/invoice).
// This controller is intentionally empty — the InvoiceBaseModule is imported by
// BookingBaseModule so that IInvoiceService can be injected into BookingController.
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {}
