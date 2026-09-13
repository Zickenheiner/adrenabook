import { render, screen } from '@testing-library/react';
import ActivitySearchFilters from './ActivitySearchFilters';
import type { GeolocationStatus } from '../pages/ActivitySearchPage';

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never;

const renderWith = (geoStatus: GeolocationStatus) =>
  render(<ActivitySearchFilters geoStatus={geoStatus} onSearch={() => {}} />);

/** Le déclencheur du select placé juste sous le libellé « Rayon (km) ». */
const radiusTrigger = () =>
  screen
    .getByText('Rayon (km)')
    .parentElement!.querySelector('[data-slot="select-trigger"]')!;

describe('ActivitySearchFilters — rayon et localisation', () => {
  it('annonce la localisation en cours et garde le rayon désactivé', () => {
    renderWith('pending');

    expect(screen.getByText(/Localisation en cours/i)).toBeTruthy();
    expect(radiusTrigger()).toBeDisabled();
  });

  it('active le rayon une fois la position obtenue', () => {
    renderWith('granted');

    expect(screen.getByText(/Autour de votre position/i)).toBeTruthy();
    expect(radiusTrigger()).not.toBeDisabled();
  });

  it('explique comment débloquer le filtre quand la position est refusée', () => {
    renderWith('denied');

    expect(screen.getByText(/Activez la localisation/i)).toBeTruthy();
    expect(radiusTrigger()).toBeDisabled();
  });

  it('signale un navigateur sans géolocalisation', () => {
    renderWith('unsupported');

    expect(screen.getByText(/ne gère pas la localisation/i)).toBeTruthy();
    expect(radiusTrigger()).toBeDisabled();
  });
});
