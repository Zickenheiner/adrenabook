import endpoints from '@/core/constants/endpoints';

/**
 * Resout la valeur stockee dans `photoFileIds` en URL affichable.
 *
 * Le backend renvoie l'identifiant du fichier tel quel. Les images des
 * activites publiees sont servies sans authentification par
 * `GET /activities/photos/:fileId`, ce qu'un `<img src>` sait charger seul.
 *
 * Une valeur qui est deja une URL absolue est conservee : des activites ont pu
 * etre saisies avec un lien externe.
 */
export function resolvePhotoUrl(value?: string): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return `${import.meta.env.VITE_API_URL}${endpoints.activitySearch.photo(value)}`;
}
