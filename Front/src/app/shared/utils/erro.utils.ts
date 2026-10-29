import { HttpErrorResponse } from '@angular/common/http';

export function mensagemDeErro(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  }

  const corpo = err.error;
  if (corpo && typeof corpo === 'object' && typeof corpo.erro === 'string' && corpo.erro.trim()) {
    return corpo.erro;
  }
  if (typeof corpo === 'string' && corpo.trim()) {
    return corpo;
  }

  switch (err.status) {
    case 401: return 'Sessão expirada. Faça login novamente.';
    case 403: return 'Você não tem permissão para fazer isso.';
    case 404: return 'Não encontrado.';
    case 409: return 'Já existe um registro com esses dados.';
    default:  return err.status >= 500
      ? 'Erro no servidor. Tente novamente em instantes.'
      : 'Não foi possível concluir a operação.';
  }
}
