import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TipoToast = 'sucesso' | 'erro' | 'aviso' | 'info';

export interface Toast {
  id: number;
  tipo: TipoToast;
  mensagem: string;
  duracaoMs: number;
}

const DURACAO_PADRAO: Record<TipoToast, number> = {
  sucesso: 4000,
  info: 4000,
  aviso: 6000,
  erro: 7000,
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  private proximoId = 1;

  sucesso(mensagem: string): void { this.mostrar('sucesso', mensagem); }
  erro(mensagem: string): void { this.mostrar('erro', mensagem); }
  aviso(mensagem: string): void { this.mostrar('aviso', mensagem); }
  info(mensagem: string): void { this.mostrar('info', mensagem); }

  fechar(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }

  private mostrar(tipo: TipoToast, mensagem: string): void {
    const duracaoMs = DURACAO_PADRAO[tipo];
    const toast: Toast = { id: this.proximoId++, tipo, mensagem, duracaoMs };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.fechar(toast.id), duracaoMs);
  }
}
