import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PaymentRepository } from './payment.repository';
import { PaymentMapper } from '../mappers/payment.mapper';
import { Payment } from '@features/payment/domains/schemas/payment.schema';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
} from '@features/payment/domains/dtos/payment.dto';

/**
 * Query Mongoose chainable : exec() resout la valeur finale.
 */
interface ChainableQuery {
  exec: jest.Mock;
}

const mockQuery = (result: unknown): ChainableQuery => ({
  exec: jest.fn().mockResolvedValue(result),
});

interface PaymentModelMock extends jest.Mock {
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
}

describe('PaymentRepository', () => {
  let repository: PaymentRepository;
  let paymentModel: PaymentModelMock;
  let paymentMapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn();

    paymentModel = jest.fn().mockImplementation((data: unknown) => ({
      ...(data as Record<string, unknown>),
      save: saveMock,
    })) as unknown as PaymentModelMock;

    paymentModel.find = jest.fn();
    paymentModel.findById = jest.fn();
    paymentModel.findByIdAndUpdate = jest.fn();
    paymentModel.findByIdAndDelete = jest.fn();

    paymentMapper = {
      toEntity: jest.fn((doc: { _id: unknown }) => ({
        entityFor: String(doc._id),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRepository,
        { provide: getModelToken(Payment.name), useValue: paymentModel },
        { provide: PaymentMapper, useValue: paymentMapper },
      ],
    }).compile();

    repository = module.get<PaymentRepository>(PaymentRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    it('should map every document to an entity', async () => {
      paymentModel.find.mockReturnValue(
        mockQuery([{ _id: 'p1' }, { _id: 'p2' }]),
      );

      const result = await repository.findAll();

      expect(paymentModel.find).toHaveBeenCalledWith();
      expect(result).toEqual([{ entityFor: 'p1' }, { entityFor: 'p2' }]);
    });

    it('should return an empty array when no payment exists', async () => {
      paymentModel.find.mockReturnValue(mockQuery([]));

      expect(await repository.findAll()).toEqual([]);
      expect(paymentMapper.toEntity).not.toHaveBeenCalled();
    });

    it('should return null when the query resolves to null', async () => {
      paymentModel.find.mockReturnValue(mockQuery(null));

      expect(await repository.findAll()).toBeNull();
    });
  });

  describe('findById()', () => {
    it('should map the found document', async () => {
      paymentModel.findById.mockReturnValue(mockQuery({ _id: 'p1' }));

      const result = await repository.findById('p1');

      expect(paymentModel.findById).toHaveBeenCalledWith('p1');
      expect(result).toEqual({ entityFor: 'p1' });
    });

    it('should return null when the payment does not exist', async () => {
      paymentModel.findById.mockReturnValue(mockQuery(null));

      expect(await repository.findById('missing')).toBeNull();
      expect(paymentMapper.toEntity).not.toHaveBeenCalled();
    });
  });

  describe('create()', () => {
    it('should return true when the document is saved', async () => {
      saveMock.mockResolvedValue({ _id: 'created' });

      const dto = {} as CreatePaymentDto;
      const result = await repository.create(dto);

      expect(paymentModel).toHaveBeenCalledWith(dto);
      expect(result).toBe(true);
    });

    it('should return false when the save returns nothing', async () => {
      saveMock.mockResolvedValue(null);

      expect(await repository.create({} as CreatePaymentDto)).toBe(false);
    });
  });

  describe('update()', () => {
    it('should return true when the payment was updated', async () => {
      paymentModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'p1' }));

      const dto = {} as UpdatePaymentDto;
      const result = await repository.update('p1', dto);

      expect(paymentModel.findByIdAndUpdate).toHaveBeenCalledWith('p1', dto, {
        new: true,
      });
      expect(result).toBe(true);
    });

    it('should return false when no payment matched', async () => {
      paymentModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));

      expect(await repository.update('missing', {} as UpdatePaymentDto)).toBe(
        false,
      );
    });
  });

  describe('delete()', () => {
    it('should return true when the payment was deleted', async () => {
      paymentModel.findByIdAndDelete.mockReturnValue(mockQuery({ _id: 'p1' }));

      expect(await repository.delete('p1')).toBe(true);
      expect(paymentModel.findByIdAndDelete).toHaveBeenCalledWith('p1');
    });

    it('should return false when no payment matched', async () => {
      paymentModel.findByIdAndDelete.mockReturnValue(mockQuery(null));

      expect(await repository.delete('missing')).toBe(false);
    });
  });
});
