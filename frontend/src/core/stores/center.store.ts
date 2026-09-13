import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CenterState {
  /** Centre sur lequel portent les ecrans professionnels. */
  currentCenterId: string | null;
  setCurrentCenterId: (id: string | null) => void;
}

/**
 * Centre courant du professionnel, partage par la barre de navigation et les
 * ecrans pro. Persiste pour survivre a un rechargement : reprendre a zero
 * renverrait l'utilisateur sur un autre centre que celui qu'il consultait.
 */
export const useCenterStore = create<CenterState>()(
  persist(
    (set) => ({
      currentCenterId: null,
      setCurrentCenterId: (id) => set({ currentCenterId: id }),
    }),
    { name: 'adrenabook.current-center' },
  ),
);
