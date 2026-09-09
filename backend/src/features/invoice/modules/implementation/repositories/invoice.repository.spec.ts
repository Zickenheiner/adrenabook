import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceMapper } from '../mappers/invoice.mapper';
import { Invoice } from '@features/invoice/domains/schemas/invoice.schema';
import { CreateInvoiceDto } from '@features/invoice/domains/dtos/invoice.dto';

/**
 * Query Mongoose chainable : exec() resout la valeur finale.
 */
interface ChainableQuery {
  exec: jest.Mock;
}

const mockQuery = (result: unknown): ChainableQuery => ({
  exec: jest.fn().mockResolvedValue(result),
});

interface InvoiceModelMock extends jest.Mock {
  findOne: jest.Mock;
  countDocuments: jest.Mock;
}

describe('InvoiceRepository', () => {
  let repository: InvoiceRepository;
  let invoiceModel: InvoiceModelMock;
  let invoiceMapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  const bookingId = new Types.ObjectId();
  const userId = new Types.ObjectId();

  const createDto: CreateInvoiceDto = {
    bookingId: bookingId.toString(),
    userId: userId.toString(),
    invoiceNumber: 'INV-2026-000123',
    issuedAt: '2026-05-11T10:00:00.000Z',
    totalEur: 120,
    vatEur: 20,
  };

  beforeEach(async () => {
    saveMock = jest.fn();

    invoiceModel = jest.fn().mockImplementation((data: unknown) => ({
      ...(data as Record<string, unknown>),
      save: saveMock,
    })) as unknown as InvoiceModelMock;

    invoiceModel.findOne = jest.fn();
    invoiceModel.countDocuments = jest.fn();

    invoiceMapper = {
      toEntity: jest.fn((doc: { _id: unknown }) => ({
        entityFor: String(doc._id),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceRepository,
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
        { provide: InvoiceMapper, useValue: invoiceMapper },
      ],
    }).compile();

    repository = module.get<InvoiceRepository>(InvoiceRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByBookingId()', () => {
    it('should query with the booking ObjectId and map the document', async () => {
      invoiceModel.findOne.mockReturnValue(mockQuery({ _id: 'i1' }));

      const result = await repository.findByBookingId(bookingId.toString());

      expect(invoiceModel.findOne).toHaveBeenCalledWith({
        bookingId: expect.any(Types.ObjectId),
      });
      const filter = invoiceModel.findOne.mock.calls[0][0] as {
        bookingId: Types.ObjectId;
      };
      expect(filter.bookingId.toString()).toBe(bookingId.toString());
      expect(result).toEqual({ entityFor: 'i1' });
    });

    it('should return null when no invoice matches the booking', async () => {
      invoiceModel.findOne.mockReturnValue(mockQuery(null));

      expect(await repository.findByBookingId(bookingId.toString())).toBeNull();
      expect(invoiceMapper.toEntity).not.toHaveBeenCalled();
    });

    it('should throw when the booking id is not a valid ObjectId', async () => {
      await expect(
        repository.findByBookingId('not-an-object-id'),
      ).rejects.toThrow();
      expect(invoiceModel.findOne).not.toHaveBeenCalled();
    });
  });

  describe('create()', () => {
    it('should build the document with casted ids and dates', async () => {
      saveMock.mockResolvedValue({ _id: 'created' });

      const result = await repository.create(createDto);

      expect(invoiceModel).toHaveBeenCalledWith({
        bookingId: expect.any(Types.ObjectId),
        userId: expect.any(Types.ObjectId),
        invoiceNumber: 'INV-2026-000123',
        issuedAt: new Date('2026-05-11T10:00:00.000Z'),
        totalEur: 120,
        vatEur: 20,
      });
      const payload = invoiceModel.mock.calls[0][0] as {
        bookingId: Types.ObjectId;
        userId: Types.ObjectId;
      };
      expect(payload.bookingId.toString()).toBe(bookingId.toString());
      expect(payload.userId.toString()).toBe(userId.toString());
      expect(result).toEqual({ entityFor: 'created' });
    });

    it('should return null when the save returns nothing', async () => {
      saveMock.mockResolvedValue(null);

      expect(await repository.create(createDto)).toBeNull();
      expect(invoiceMapper.toEntity).not.toHaveBeenCalled();
    });

    it('should throw when the booking id is not a valid ObjectId', async () => {
      await expect(
        repository.create({ ...createDto, bookingId: 'nope' }),
      ).rejects.toThrow();
    });

    it('should propagate a save rejection', async () => {
      saveMock.mockRejectedValue(new Error('duplicate invoice number'));

      await expect(repository.create(createDto)).rejects.toThrow(
        'duplicate invoice number',
      );
    });
  });

  describe('getNextInvoiceNumber()', () => {
    it('should build the number from the current year and the count plus one', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-20T12:00:00.000Z'));
      invoiceModel.countDocuments.mockReturnValue(mockQuery(122));

      const result = await repository.getNextInvoiceNumber();

      expect(invoiceModel.countDocuments).toHaveBeenCalledWith();
      expect(result).toBe('INV-2026-000123');
    });

    it('should start the sequence at 1 when the collection is empty', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
      invoiceModel.countDocuments.mockReturnValue(mockQuery(0));

      expect(await repository.getNextInvoiceNumber()).toBe('INV-2026-000001');
    });

    it('should not truncate a sequence longer than 6 digits', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2027-06-15T12:00:00.000Z'));
      invoiceModel.countDocuments.mockReturnValue(mockQuery(1234567));

      expect(await repository.getNextInvoiceNumber()).toBe('INV-2027-1234568');
    });
  });
});
