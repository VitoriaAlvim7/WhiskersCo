
export const ITENS_POR_PAGINA = 10;

export function fatiarPagina<T>(itens: T[], pagina: number, tamanho = ITENS_POR_PAGINA): T[] {
  const inicio = (pagina - 1) * tamanho;
  return itens.slice(inicio, inicio + tamanho);
}

export function totalDePaginas(total: number, tamanho = ITENS_POR_PAGINA): number {
  return Math.max(1, Math.ceil(total / tamanho));
}

export function paginaValida(pagina: number, total: number, tamanho = ITENS_POR_PAGINA): number {
  return Math.min(Math.max(1, pagina), totalDePaginas(total, tamanho));
}
