import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';

/**
 * Les deux boutons de navigation ne doivent pas partager leur noeud DOM : le
 * passage a l'etape suivante changerait le `type` du bouton sous le curseur,
 * et le clic se terminerait en soumission.
 */
function Demo() {
  const [step, setStep] = useState(0);
  return (
    <form>
      {step < 1 ? (
        <button key="next" type="button" onClick={() => setStep(1)}>
          Suivant
        </button>
      ) : (
        <button key="submit" type="submit">
          Soumettre
        </button>
      )}
    </form>
  );
}

describe('navigation par étapes', () => {
  it('remplace le bouton plutôt que de changer son type', () => {
    render(<Demo />);

    const before = screen.getByRole('button');
    fireEvent.click(before);
    const after = screen.getByRole('button');

    expect(after).not.toBe(before);
    expect(after.getAttribute('type')).toBe('submit');
  });
});
