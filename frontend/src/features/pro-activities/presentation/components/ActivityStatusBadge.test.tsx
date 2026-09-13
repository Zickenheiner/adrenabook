import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityStatusBadge from './ActivityStatusBadge';

describe('ActivityStatusBadge', () => {
  it('affiche "Publiée" pour une activité en ligne', () => {
    render(<ActivityStatusBadge status="published" />);
    expect(screen.getByText('Publiée')).toBeInTheDocument();
  });

  it('affiche "Non publiée" pour une activité hors ligne', () => {
    render(<ActivityStatusBadge status="unpublished" />);
    expect(screen.getByText('Non publiée')).toBeInTheDocument();
  });
});
