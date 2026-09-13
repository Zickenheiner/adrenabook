import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityCard from './ActivityCard';
import type { ActivityEntity } from '../../domain/entities/activity.entity';

const buildActivity = (
  overrides: Partial<ActivityEntity> = {},
): ActivityEntity => ({
  id: 'activity-1',
  title: 'Bloc à Fontainebleau',
  description: 'Escalade sur les blocs de grès de la forêt.',
  type: 'climbing',
  difficulty: 'beginner',
  durationMinutes: 180,
  priceEur: 45,
  prerequisites: { minAge: 12, medicalCertificateRequired: false },
  includedEquipment: [],
  photoFileIds: [],
  status: 'published',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const openMenu = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /actions/i }));
  return user;
};

describe('ActivityCard', () => {
  it('propose les deux statuts dans le menu', async () => {
    render(
      <ActivityCard activity={buildActivity()} onStatusChange={vi.fn()} />,
    );
    await openMenu();

    expect(
      screen.getByRole('menuitemradio', { name: 'Publiée' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: 'Non publiée' }),
    ).toBeInTheDocument();
  });

  it('coche le statut courant de l’activité', async () => {
    render(
      <ActivityCard
        activity={buildActivity({ status: 'unpublished' })}
        onStatusChange={vi.fn()}
      />,
    );
    await openMenu();

    expect(
      screen.getByRole('menuitemradio', { name: 'Non publiée' }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: 'Publiée' }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('remonte le statut choisi avec l’identifiant de l’activité', async () => {
    const onStatusChange = vi.fn();
    render(
      <ActivityCard
        activity={buildActivity({ status: 'unpublished' })}
        onStatusChange={onStatusChange}
      />,
    );
    const user = await openMenu();

    await user.click(screen.getByRole('menuitemradio', { name: 'Publiée' }));

    expect(onStatusChange).toHaveBeenCalledWith('activity-1', 'published');
  });

  it('désactive le choix du statut pendant une mise à jour en cours', async () => {
    render(
      <ActivityCard
        activity={buildActivity()}
        onStatusChange={vi.fn()}
        statusIsPending
      />,
    );
    await openMenu();

    expect(
      screen.getByRole('menuitemradio', { name: 'Non publiée' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('n’affiche aucune section statut sans gestionnaire', async () => {
    render(<ActivityCard activity={buildActivity()} onEdit={vi.fn()} />);
    await openMenu();

    expect(screen.queryByRole('menuitemradio')).not.toBeInTheDocument();
  });
});
