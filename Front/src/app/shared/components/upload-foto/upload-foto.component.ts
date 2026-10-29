import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ArquivoService,
  TAMANHO_MAXIMO_FOTO_BYTES,
  TIPOS_IMAGEM_ACEITOS,
} from '../../../core/services/arquivo.service';
import { contextoSemToast } from '../../../core/http/toast.context';
import { mensagemDeErro } from '../../utils/erro.utils';
import { NomeIcone } from '../icon/icon.component';

@Component({
  selector: 'app-upload-foto',
  templateUrl: './upload-foto.component.html',
  styleUrls: ['./upload-foto.component.scss']
})
export class UploadFotoComponent {
  @Input() fotoUrl?: string | null;
  @Input() descricao = '';
  @Input() iconePlaceholder: NomeIcone = 'pata';
  @Input() rotulo = 'Foto';

  @Output() fotoUrlChange = new EventEmitter<string | null>();

  enviando = false;
  erro = '';

  readonly idCampo = `upload-foto-${Math.random().toString(36).slice(2, 9)}`;

  readonly tiposAceitos = TIPOS_IMAGEM_ACEITOS.join(',');

  constructor(private arquivoService: ArquivoService) {}

  get temFoto(): boolean {
    return !!this.fotoUrl;
  }

  get src(): string {
    return this.arquivoService.urlAbsoluta(this.fotoUrl);
  }

  get alt(): string {
    return this.descricao ? `Foto de ${this.descricao}` : 'Foto enviada';
  }

  selecionar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    this.erro = '';

    if (!TIPOS_IMAGEM_ACEITOS.includes(arquivo.type)) {
      this.erro = 'Formato não aceito. Escolha uma imagem JPG, PNG ou WEBP.';
      input.value = '';
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
      const mb = (arquivo.size / 1024 / 1024).toFixed(1).replace('.', ',');
      this.erro = `A imagem tem ${mb} MB e o limite é ${TAMANHO_MAXIMO_FOTO_BYTES / (1024 * 1024)} MB.`;
      input.value = '';
      return;
    }

    this.enviando = true;
    this.arquivoService.enviarFoto(arquivo, contextoSemToast()).subscribe({
      next: resposta => {
        this.fotoUrl = resposta.url;
        this.fotoUrlChange.emit(resposta.url);
        this.enviando = false;
        input.value = '';
      },
      error: err => {
        this.erro = mensagemDeErro(err);
        this.enviando = false;
        input.value = '';
      }
    });
  }

  remover(): void {
    this.erro = '';
    this.fotoUrl = null;
    this.fotoUrlChange.emit(null);
  }
}
