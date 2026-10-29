
export function maskCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digitos
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function maskPeso(valor: string): string {
  const limpo = valor.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [inteiro, ...resto] = limpo.split(',');
  const parteInteira = inteiro.slice(0, 3);
  if (!resto.length) return parteInteira;
  return `${parteInteira || '0'},${resto.join('').slice(0, 2)}`;
}

export const PESO_PADRAO = /^\d{1,3}(,\d{1,2})?$/;

export function pesoParaNumero(valor: string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(String(valor).replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

export function pesoParaTexto(valor?: number | null): string {
  if (valor === null || valor === undefined) return '';
  return String(valor).replace('.', ',');
}

export const CPF_PADRAO = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const TELEFONE_PADRAO = /^\(\d{2}\) \d{4,5}-\d{4}$/;
