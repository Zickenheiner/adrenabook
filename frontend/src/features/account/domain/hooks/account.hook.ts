import { useQuery } from '@tanstack/react-query';
import { getSessionUser } from '@/core/utils/session';
import AccountRepositoryImpl from '../../data/repositories/account.repository.impl';

const repository = new AccountRepositoryImpl();

const QUERY_KEYS = {
  account: (id: string) => ['account', id] as const,
};

/**
 * Titulaire du compte courant, identifie par le `sub` du jeton d'acces.
 *
 * Le jeton ne porte que l'identifiant, l'email et le role : l'etat civil
 * necessaire au pre-remplissage d'un formulaire vient de l'API.
 */
export function useCurrentAccount() {
  const sessionUser = getSessionUser();
  const userId = sessionUser?.id ?? '';

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.account(userId),
    queryFn: () => repository.getById(userId),
    enabled: !!userId,
    retry: false,
    // L'etat civil ne bouge pas en cours de navigation.
    staleTime: 5 * 60 * 1000,
  });

  return {
    account: data,
    accountIsLoading: isLoading,
    accountError: error,
  };
}

export { QUERY_KEYS as accountQueryKeys };
