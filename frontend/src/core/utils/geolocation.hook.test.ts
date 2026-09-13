import { act, renderHook, waitFor } from '@testing-library/react';
import { useGeolocation } from './geolocation.hook';

type PermissionListener = () => void;

/** PermissionStatus minimal, dont l'état peut être changé par le test. */
function fakePermission(initial: PermissionState) {
  const listeners: PermissionListener[] = [];
  return {
    state: initial,
    addEventListener: (_: string, cb: PermissionListener) => listeners.push(cb),
    removeEventListener: () => {},
    /** Simule l'autorisation accordée depuis les réglages du navigateur. */
    change(next: PermissionState) {
      this.state = next;
      listeners.forEach((cb) => cb());
    },
  };
}

describe('useGeolocation', () => {
  let getCurrentPosition: ReturnType<typeof vi.fn>;

  const grant = () =>
    getCurrentPosition.mockImplementation((onSuccess: (p: unknown) => void) =>
      onSuccess({ coords: { latitude: 43.6, longitude: 1.44 } }),
    );

  const deny = () =>
    getCurrentPosition.mockImplementation((_: unknown, onError: () => void) =>
      onError(),
    );

  beforeEach(() => {
    getCurrentPosition = vi.fn();
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
      permissions: undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('expose la position une fois accordée', async () => {
    grant();

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.status).toBe('granted'));
    expect(result.current.position).toEqual({ lat: 43.6, lng: 1.44 });
  });

  it('passe en refusé sans position', async () => {
    deny();

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.status).toBe('denied'));
    expect(result.current.position).toBeNull();
  });

  it('signale un navigateur sans géolocalisation', async () => {
    vi.stubGlobal('navigator', { geolocation: undefined });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.status).toBe('unsupported'));
  });

  it('reprend la position après un refus, sans recharger la page', async () => {
    deny();
    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.status).toBe('denied'));

    grant();
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe('granted'));
    expect(result.current.position).toEqual({ lat: 43.6, lng: 1.44 });
  });

  it("se relocalise quand l'autorisation est accordée depuis le navigateur", async () => {
    const permission = fakePermission('denied');
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
      permissions: { query: () => Promise.resolve(permission) },
    });
    deny();

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.status).toBe('denied'));

    // L'utilisateur autorise la localisation dans les réglages : le hook doit
    // reprendre seul, c'est précisément ce qui imposait un rechargement.
    grant();
    act(() => permission.change('granted'));

    await waitFor(() => expect(result.current.status).toBe('granted'));
    expect(result.current.position).toEqual({ lat: 43.6, lng: 1.44 });
  });

  it("repasse en refusé quand l'autorisation est révoquée", async () => {
    const permission = fakePermission('granted');
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
      permissions: { query: () => Promise.resolve(permission) },
    });
    grant();

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.status).toBe('granted'));

    act(() => permission.change('denied'));

    await waitFor(() => expect(result.current.status).toBe('denied'));
    expect(result.current.position).toBeNull();
  });
});
