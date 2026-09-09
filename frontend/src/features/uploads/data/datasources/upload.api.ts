import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import { getAccessToken } from '@/core/local/storage';
import { ApiError } from '@/core/errors/api.error';
import type { UploadResponseDto } from '../dtos/upload.dto';

class UploadApi {
  private readonly baseUrl: string = endpoints.uploads.create;

  async upload(file: File): Promise<UploadResponseDto> {
    const formData = new FormData();
    formData.append('file', file);

    return request<UploadResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data: formData,
    });
  }

  /**
   * Recupere le contenu d'un fichier.
   *
   * GET /uploads/:id exige un jeton Bearer : un simple lien <a href> ne le
   * transmettrait pas et recevrait un 401. On passe donc par fetch, puis on
   * expose le resultat en blob local.
   */
  async download(fileId: string): Promise<Blob> {
    const token = getAccessToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}${endpoints.uploads.byId(fileId)}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    );

    if (!response.ok) {
      throw new ApiError(
        response.status === 403
          ? 'Accès refusé à ce document.'
          : 'Document introuvable.',
        response.status,
      );
    }

    return response.blob();
  }
}

export default UploadApi;
