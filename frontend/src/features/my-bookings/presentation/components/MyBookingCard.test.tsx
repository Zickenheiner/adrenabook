import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyBookingCard from './MyBookingCard';
import type { MyBookingEntity } from '../../domain/entities/my-booking.entity';

const inDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const booking = (
  overrides: Partial<MyBookingEntity> = {},
): MyBookingEntity => ({
  bookingId: 'booking-1',
  activityTitle: 'Parapente biplace',
  activityId: 'activity-1',
  centerName: 'Chamonix Vertical',
  centerAddress: '12 rue des Alpes, 74400 Chamonix, France',
  startAt: inDays(10),
  durationMinutes: 90,
  participants: 2,
  status: 'confirmed',
  totalEur: 240,
  paidAmountEur: 240,
  remainingAmountEur: 0,
  waiverSigned: true,
  coverPhotoUrl: '',
  ...overrides,
});

const renderCard = (entity: MyBookingEntity) =>
  render(
    <MemoryRouter>
      <MyBookingCard booking={entity} />
    </MemoryRouter>,
  );

describe('MyBookingCard', () => {
  it('shows the activity, the center and its address', () => {
    renderCard(booking());

    expect(screen.getByText('Parapente biplace')).toBeTruthy();
    expect(screen.getByText('Chamonix Vertical')).toBeTruthy();
    expect(screen.getByText(/74400 Chamonix/)).toBeTruthy();
  });

  it('offers to pay a booking still awaiting payment', () => {
    renderCard(booking({ status: 'pending_payment' }));

    expect(screen.getByRole('link', { name: /Payer/i })).toBeTruthy();
  });

  it('does not offer to pay once the booking is confirmed', () => {
    renderCard(booking());

    expect(screen.queryByRole('link', { name: /^Payer/i })).toBeNull();
  });

  it('offers to sign the waiver only while it is missing', () => {
    renderCard(booking({ waiverSigned: false }));

    expect(screen.getByRole('link', { name: /décharge/i })).toBeTruthy();
  });

  it('hides the waiver link once it is signed', () => {
    renderCard(booking());

    expect(screen.queryByRole('link', { name: /décharge/i })).toBeNull();
  });

  it('offers the invoice for a paid booking', () => {
    renderCard(booking());

    expect(screen.getByRole('link', { name: /Facture/i })).toBeTruthy();
  });

  it('leaves a past booking nothing to prepare but its invoice', () => {
    renderCard(booking({ startAt: inDays(-3), waiverSigned: false }));

    expect(screen.queryByRole('link', { name: /Annuler/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /décharge/i })).toBeNull();
    expect(screen.getByRole('link', { name: /Facture/i })).toBeTruthy();
  });

  it('offers nothing to act on for a cancelled booking', () => {
    renderCard(booking({ status: 'cancelled', waiverSigned: false }));

    expect(screen.getByText('Annulée')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Annuler/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /^Payer/i })).toBeNull();
  });

  it('spells out what is left to pay after a deposit', () => {
    renderCard(
      booking({
        status: 'partial_paid',
        paidAmountEur: 72,
        remainingAmountEur: 168,
      }),
    );

    expect(screen.getByText(/reste/i)).toBeTruthy();
    expect(screen.getByText(/168/)).toBeTruthy();
  });
});
