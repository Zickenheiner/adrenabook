import { Test, TestingModule } from '@nestjs/testing';
import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let fetchMock: jest.Mock;

  const address = {
    street: '13 Rte de Lavaur',
    postalCode: '31240',
    city: "L'Union",
  };

  const okResponse = (body: unknown) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeocodingService],
    }).compile();

    service = module.get<GeocodingService>(GeocodingService);

    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should convert an address into coordinates', async () => {
    fetchMock.mockResolvedValue(
      okResponse({
        features: [{ geometry: { coordinates: [1.4989, 43.6753] } }],
      }),
    );

    const result = await service.geocode(address);

    // L'API renvoie du GeoJSON : [longitude, latitude], pas l'inverse.
    expect(result).toEqual({ lat: 43.6753, lng: 1.4989 });
  });

  it('should send the full address as a single query', async () => {
    fetchMock.mockResolvedValue(
      okResponse({ features: [{ geometry: { coordinates: [1, 43] } }] }),
    );

    await service.geocode(address);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain(encodeURIComponent("13 Rte de Lavaur 31240 L'Union"));
    expect(url).toContain('limit=1');
  });

  it('should return null without calling the API when the address is empty', async () => {
    const result = await service.geocode({
      street: '',
      postalCode: '',
      city: '',
    });

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should return null when the address is not found', async () => {
    fetchMock.mockResolvedValue(okResponse({ features: [] }));

    expect(await service.geocode(address)).toBeNull();
  });

  it('should return null when the API answers an error status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: () => ({}) });

    expect(await service.geocode(address)).toBeNull();
  });

  it('should never throw when the network fails', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(service.geocode(address)).resolves.toBeNull();
  });
});
