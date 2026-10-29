import { Injectable } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import {
  DadosReceita,
  ESTILO_RECEITA,
  LARGURA_RECEITA_PX,
  montarCorpoReceita,
  montarDocumentoReceita,
  nomeArquivoReceita,
} from './receita.template';

@Injectable({ providedIn: 'root' })
export class ReceitaService {

  constructor(private toast: ToastService) {}

  imprimir(dados: DadosReceita): void {
    const janela = window.open('', '_blank');
    if (!janela) {
      this.toast.aviso('O navegador bloqueou a janela de impressão. Libere pop-ups para este site.');
      return;
    }
    janela.document.write(montarDocumentoReceita(dados));
    janela.document.close();
    janela.onload = () => janela.print();
  }

  async baixar(dados: DadosReceita): Promise<void> {
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.cssText =
      `position:fixed;left:-10000px;top:0;width:${LARGURA_RECEITA_PX}px;background:#ffffff;`;
    container.innerHTML = `<style>${ESTILO_RECEITA}</style>${montarCorpoReceita(dados)}`;
    document.body.appendChild(container);

    try {
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas').then(m => m.default),
      ]);

      const folha = container.querySelector('.folha') as HTMLElement;
      const canvas = await html2canvas(folha, { scale: 2, backgroundColor: '#ffffff' });
      const imagem = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const margem = 10;
      const larguraUtil = pdf.internal.pageSize.getWidth() - margem * 2;
      const alturaUtil = pdf.internal.pageSize.getHeight() - margem * 2;
      const alturaImagem = (canvas.height * larguraUtil) / canvas.width;

      let posicao = margem;
      let restante = alturaImagem;
      pdf.addImage(imagem, 'JPEG', margem, posicao, larguraUtil, alturaImagem);
      restante -= alturaUtil;

      while (restante > 0) {
        posicao -= alturaUtil;
        pdf.addPage();
        pdf.addImage(imagem, 'JPEG', margem, posicao, larguraUtil, alturaImagem);
        restante -= alturaUtil;
      }

      pdf.save(nomeArquivoReceita(dados));
    } catch {
      this.toast.erro('Não foi possível gerar o PDF da receita.');
    } finally {
      container.remove();
    }
  }
}
