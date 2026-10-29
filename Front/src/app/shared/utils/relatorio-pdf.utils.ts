import type { jsPDF } from 'jspdf';

// Gera o PDF dos relatórios (Agenda e Caixa) desenhando texto e tabelas direto
// com o jsPDF: o texto sai nítido e pesquisável, e tabelas longas quebram de
// página sem cortar linhas ao meio (o que aconteceria com uma "foto" da tela).

type Rgb = [number, number, number];

const ROXO: Rgb = [109, 40, 217];
const ROXO_CLARO: Rgb = [245, 243, 255];
const ROXO_BORDA: Rgb = [221, 214, 254];
const CABECALHO_TABELA: Rgb = [237, 233, 254];
const TEXTO: Rgb = [31, 41, 55];
const CINZA: Rgb = [107, 114, 128];
const LINHA: Rgb = [229, 231, 235];
const ZEBRA: Rgb = [250, 250, 252];

export const VERDE: Rgb = [21, 128, 61];
export const VERMELHO: Rgb = [185, 28, 28];

const PAGINA_W = 210;
const PAGINA_H = 297;
const MARGEM = 15;
const LARGURA_UTIL = PAGINA_W - MARGEM * 2;
const LIMITE_Y = PAGINA_H - 20;

export interface ColunaPdf {
  titulo: string;
  /** Fração da largura útil (as frações de uma tabela somam 1). */
  largura: number;
  alinhar?: 'left' | 'right';
}

export interface TabelaPdf {
  titulo: string;
  colunas: ColunaPdf[];
  linhas: string[][];
  vazio: string;
}

export interface ResumoPdf {
  rotulo: string;
  valor: string;
  detalhe?: string;
  cor?: Rgb;
}

export interface RelatorioPdf {
  titulo: string;
  periodo: string;
  resumo: ResumoPdf[];
  tabelas: TabelaPdf[];
  nota?: string;
  nomeArquivo: string;
}

export async function baixarRelatorioPdf(relatorio: RelatorioPdf): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const desenho = new Desenho(pdf);

  desenho.cabecalho(relatorio.titulo, relatorio.periodo);
  if (relatorio.resumo.length) desenho.resumo(relatorio.resumo);
  relatorio.tabelas.forEach(t => desenho.tabela(t));
  if (relatorio.nota) desenho.nota(relatorio.nota);
  desenho.rodapes();

  pdf.save(relatorio.nomeArquivo);
}

export function nomeArquivoRelatorio(tipo: string, inicio: string, fim: string): string {
  const br = (iso: string) => iso.split('-').reverse().join('-');
  return inicio === fim
    ? `relatorio-${tipo}-${br(inicio)}.pdf`
    : `relatorio-${tipo}-${br(inicio)}-a-${br(fim)}.pdf`;
}

class Desenho {
  private y = MARGEM;

  constructor(private pdf: jsPDF) {}

  cabecalho(titulo: string, periodo: string): void {
    const { pdf } = this;
    const agora = new Date();
    const emitido = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    this.fonte('bold', 18, ROXO);
    pdf.text('Whiskers & Co.', MARGEM, this.y + 6);
    this.fonte('normal', 9, CINZA);
    pdf.text('Clínica Veterinária', MARGEM, this.y + 11);

    const direita = PAGINA_W - MARGEM;
    this.fonte('bold', 10, ROXO);
    pdf.text(titulo.toUpperCase(), direita, this.y + 4, { align: 'right', charSpace: 0.6 });
    this.fonte('normal', 9, CINZA);
    pdf.text(`Período: ${periodo}`, direita, this.y + 9, { align: 'right' });
    pdf.text(`Emitido em ${emitido}`, direita, this.y + 13.5, { align: 'right' });

    this.y += 17;
    pdf.setFillColor(...ROXO);
    pdf.rect(MARGEM, this.y, LARGURA_UTIL, 0.9, 'F');
    this.y += 8;
  }

  resumo(blocos: ResumoPdf[]): void {
    const { pdf } = this;
    const gap = 4;
    const largura = (LARGURA_UTIL - gap * (blocos.length - 1)) / blocos.length;
    const altura = 21;

    blocos.forEach((b, i) => {
      const x = MARGEM + i * (largura + gap);
      pdf.setFillColor(...ROXO_CLARO);
      pdf.setDrawColor(...ROXO_BORDA);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(x, this.y, largura, altura, 2.5, 2.5, 'FD');

      this.fonte('normal', 7.5, ROXO);
      pdf.text(b.rotulo.toUpperCase(), x + 4, this.y + 6, { charSpace: 0.3 });
      this.fonte('bold', 13, b.cor ?? TEXTO);
      pdf.text(b.valor, x + 4, this.y + 13);
      if (b.detalhe) {
        this.fonte('normal', 8, CINZA);
        pdf.text(b.detalhe, x + 4, this.y + 18);
      }
    });

    this.y += altura + 4;
  }

  tabela(t: TabelaPdf): void {
    const { pdf } = this;
    const larguras = t.colunas.map(c => c.largura * LARGURA_UTIL);
    const padX = 2.5;
    const linhaTexto = 4;

    this.garantirEspaco(10 + 8 + 8);
    this.y += 4;
    this.fonte('bold', 8.5, CINZA);
    pdf.text(t.titulo.toUpperCase(), MARGEM, this.y, { charSpace: 0.5 });
    this.y += 3;

    const desenharCabecalho = () => {
      pdf.setFillColor(...CABECALHO_TABELA);
      pdf.rect(MARGEM, this.y, LARGURA_UTIL, 7, 'F');
      this.fonte('bold', 8.5, TEXTO);
      let x = MARGEM;
      t.colunas.forEach((c, i) => {
        const tx = c.alinhar === 'right' ? x + larguras[i] - padX : x + padX;
        pdf.text(c.titulo, tx, this.y + 4.8, { align: c.alinhar ?? 'left' });
        x += larguras[i];
      });
      this.y += 7;
    };

    desenharCabecalho();

    if (!t.linhas.length) {
      this.fonte('italic', 8.5, CINZA);
      pdf.text(t.vazio, MARGEM + padX, this.y + 5);
      this.y += 8;
      this.linhaFina();
      this.y += 2;
      return;
    }

    t.linhas.forEach((linha, idx) => {
      this.fonte('normal', 8.5, TEXTO);
      const celulas = linha.map((valor, i) =>
        pdf.splitTextToSize(valor ?? '', larguras[i] - padX * 2) as string[]);
      const altura = Math.max(...celulas.map(c => c.length)) * linhaTexto + 3;

      if (this.y + altura > LIMITE_Y) {
        this.novaPagina();
        desenharCabecalho();
        this.fonte('normal', 8.5, TEXTO);
      }

      if (idx % 2 === 1) {
        pdf.setFillColor(...ZEBRA);
        pdf.rect(MARGEM, this.y, LARGURA_UTIL, altura, 'F');
      }

      let x = MARGEM;
      celulas.forEach((texto, i) => {
        const c = t.colunas[i];
        const tx = c.alinhar === 'right' ? x + larguras[i] - padX : x + padX;
        pdf.text(texto, tx, this.y + 4.6, { align: c.alinhar ?? 'left' });
        x += larguras[i];
      });

      this.y += altura;
      this.linhaFina();
    });

    this.y += 2;
  }

  nota(texto: string): void {
    const { pdf } = this;
    this.fonte('normal', 8, CINZA);
    const linhas = pdf.splitTextToSize(texto, LARGURA_UTIL) as string[];
    this.garantirEspaco(linhas.length * 3.8 + 6);
    this.y += 4;
    pdf.text(linhas, MARGEM, this.y);
    this.y += linhas.length * 3.8;
  }

  rodapes(): void {
    const { pdf } = this;
    const total = pdf.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      pdf.setPage(p);
      pdf.setDrawColor(...LINHA);
      pdf.setLineWidth(0.3);
      pdf.line(MARGEM, PAGINA_H - 13, PAGINA_W - MARGEM, PAGINA_H - 13);
      this.fonte('normal', 8, CINZA);
      pdf.text('Whiskers & Co. - Clínica Veterinária · Relatório emitido pelo sistema', MARGEM, PAGINA_H - 8.5);
      pdf.text(`Página ${p} de ${total}`, PAGINA_W - MARGEM, PAGINA_H - 8.5, { align: 'right' });
    }
  }

  private linhaFina(): void {
    this.pdf.setDrawColor(...LINHA);
    this.pdf.setLineWidth(0.2);
    this.pdf.line(MARGEM, this.y, PAGINA_W - MARGEM, this.y);
  }

  private garantirEspaco(altura: number): void {
    if (this.y + altura > LIMITE_Y) this.novaPagina();
  }

  private novaPagina(): void {
    this.pdf.addPage();
    this.y = MARGEM;
  }

  private fonte(estilo: 'normal' | 'bold' | 'italic', tamanho: number, cor: Rgb): void {
    this.pdf.setFont('helvetica', estilo);
    this.pdf.setFontSize(tamanho);
    this.pdf.setTextColor(...cor);
  }
}
