import { ConfigService } from '@nestjs/config';
import { AtStrategy } from './at.strategy';

describe('AtStrategy', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
  });

  it('should be defined', () => {
    const strategy = new AtStrategy(configService);
    expect(strategy).toBeDefined();
  });

  it('should read ACCESS_TOKEN_SECRET from ConfigService at construction', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const strategy = new AtStrategy(configService);
    expect(configService.get).toHaveBeenCalledWith('ACCESS_TOKEN_SECRET');
  });

  describe('validate()', () => {
    it('should return the payload unchanged', () => {
      const strategy = new AtStrategy(configService);
      const payload = { sub: 'user-id', email: 'test@example.com' };

      const result = strategy.validate(payload);

      expect(result).toEqual(payload);
    });

    it('should accept any payload shape', () => {
      const strategy = new AtStrategy(configService);
      expect(strategy.validate(null)).toBeNull();
      expect(strategy.validate(undefined)).toBeUndefined();
      expect(strategy.validate({ foo: 'bar' })).toEqual({ foo: 'bar' });
    });
  });
});
