import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export const TIPOS_IMAGEM_ACEITOS = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp'];
export const TAMANHO_MAXIMO_FOTO_BYTES = 2 * 1024 * 1024;

@Injectable({ providedIn: 'root' })
export class ArquivoService {
  private url = `${environment.apiUrl}/arquivos`;

  constructor(private http: HttpClient) {}

  enviarFoto(arquivo: File, context?: HttpContext): Observable<{ url: string }> {
    const corpo = new FormData();
    corpo.append('arquivo', arquivo);
    return this.http.post<{ url: string }>(`${this.url}/fotos`, corpo, { context });
  }

  urlAbsoluta(caminho?: string | null): string {
    if (!caminho) return '';
    if (/^https?:\/\//i.test(caminho) || caminho.startsWith('assets/')) return caminho;
    return `${environment.arquivosUrl}${caminho}`;
  }
}
