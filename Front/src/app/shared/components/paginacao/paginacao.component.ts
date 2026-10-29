import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITENS_POR_PAGINA, totalDePaginas } from '../../utils/paginacao.utils';

const ELIPSE = 0;

const MAX_NUMEROS = 7;

@Component({
  selector: 'app-paginacao',
  templateUrl: './paginacao.component.html',
  styleUrls: ['./paginacao.component.scss']
})
export class PaginacaoComponent {
  @Input() total = 0;
  @Input() pagina = 1;
  @Input() tamanhoPagina = ITENS_POR_PAGINA;
  @Input() rotulo = 'Paginação';

  @Output() paginaChange = new EventEmitter<number>();

  readonly elipse = ELIPSE;

  get totalPaginas(): number {
    return totalDePaginas(this.total, this.tamanhoPagina);
  }

  get primeiroItem(): number {
    return this.total === 0 ? 0 : (this.pagina - 1) * this.tamanhoPagina + 1;
  }

  get ultimoItem(): number {
    return Math.min(this.pagina * this.tamanhoPagina, this.total);
  }

  get paginas(): number[] {
    const total = this.totalPaginas;
    if (total <= MAX_NUMEROS) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const atual = this.pagina;
    const escolhidas = new Set<number>([1, total, atual, atual - 1, atual + 1]);
    if (atual <= 3) [2, 3, 4].forEach(n => escolhidas.add(n));
    if (atual >= total - 2) [total - 1, total - 2, total - 3].forEach(n => escolhidas.add(n));

    const ordenadas = [...escolhidas]
      .filter(n => n >= 1 && n <= total)
      .sort((a, b) => a - b);

    const saida: number[] = [];
    let anterior = 0;
    for (const n of ordenadas) {
      if (anterior && n - anterior > 1) saida.push(ELIPSE);
      saida.push(n);
      anterior = n;
    }
    return saida;
  }

  ir(destino: number): void {
    const alvo = Math.min(Math.max(1, destino), this.totalPaginas);
    if (alvo === this.pagina) return;
    this.paginaChange.emit(alvo);
  }
}
