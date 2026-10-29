import { HttpContext, HttpContextToken } from '@angular/common/http';

export const SUPRIMIR_TOAST_ERRO = new HttpContextToken<boolean>(() => false);

export function contextoSemToast(): HttpContext {
  return new HttpContext().set(SUPRIMIR_TOAST_ERRO, true);
}
