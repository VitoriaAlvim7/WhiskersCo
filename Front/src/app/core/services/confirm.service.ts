import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface PedidoConfirmacao {
  titulo: string;
  mensagem: string;
  aviso?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  destrutivo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pedidoSubject = new BehaviorSubject<PedidoConfirmacao | null>(null);
  readonly pedido$ = this.pedidoSubject.asObservable();

  private resposta?: Subject<boolean>;

  abrir(pedido: PedidoConfirmacao): Observable<boolean> {
    this.responder(false);
    this.resposta = new Subject<boolean>();
    this.pedidoSubject.next(pedido);
    return this.resposta.asObservable();
  }

  confirmar(): void {
    this.responder(true);
  }

  cancelar(): void {
    this.responder(false);
  }

  private responder(valor: boolean): void {
    if (!this.resposta) return;
    const pendente = this.resposta;
    this.resposta = undefined;
    this.pedidoSubject.next(null);
    pendente.next(valor);
    pendente.complete();
  }
}
