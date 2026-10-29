import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, of, timer } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notificacao } from '../models';
import { contextoSemToast } from '../http/toast.context';
import { ToastService } from './toast.service';

// O back gera o lembrete a cada minuto; consultar a cada 30 s garante que o
// aviso apareça dentro da janela de 15 minutos antes da consulta.
const INTERVALO_MS = 30_000;
const AVISADAS_KEY = 'wc_lembretes_avisados';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private url = `${environment.apiUrl}/notificacoes`;

  private readonly listaSubject = new BehaviorSubject<Notificacao[]>([]);
  readonly lista$ = this.listaSubject.asObservable();

  private monitoramento?: Subscription;

  constructor(private http: HttpClient, private toast: ToastService) {}

  listar(): Observable<Notificacao[]>            { return this.http.get<Notificacao[]>(this.url); }
  contarNaoLidas(): Observable<{ total: number }> { return this.http.get<{ total: number }>(`${this.url}/nao-lidas`); }
  marcarTodasComoLidas(): Observable<void>        { return this.http.put<void>(`${this.url}/lidas`, {}); }
  excluir(id: number): Observable<void>           { return this.http.delete<void>(`${this.url}/${id}`); }

  // UC Notificar Consultas: consulta o back periodicamente, mostra um pop-up
  // para cada lembrete novo e mantém a lista do sino atualizada.
  iniciarMonitoramento(estaLogado: () => boolean): void {
    if (this.monitoramento) return;
    this.monitoramento = timer(0, INTERVALO_MS).pipe(
      filter(() => estaLogado()),
      switchMap(() => this.http.get<Notificacao[]>(this.url, { context: contextoSemToast() }).pipe(
        catchError(() => of(null))
      )),
    ).subscribe(lista => {
      if (!lista) return;
      this.listaSubject.next(lista);
      this.avisarLembretesNovos(lista);
    });
  }

  pararMonitoramento(): void {
    this.monitoramento?.unsubscribe();
    this.monitoramento = undefined;
    this.listaSubject.next([]);
  }

  atualizarAgora(): void {
    this.listar().subscribe(lista => this.listaSubject.next(lista));
  }

  private avisarLembretesNovos(lista: Notificacao[]): void {
    const avisadas = this.lerAvisadas();
    const novas = lista.filter(n => n.tipo === 'CONSULTA_PROXIMA' && !n.lida && !avisadas.has(n.id));
    if (!novas.length) return;

    novas.forEach(n => {
      this.toast.aviso(`Próxima consulta · ${n.titulo}`);
      avisadas.add(n.id);
    });
    this.salvarAvisadas(avisadas, lista);
  }

  private lerAvisadas(): Set<number> {
    try {
      return new Set<number>(JSON.parse(sessionStorage.getItem(AVISADAS_KEY) ?? '[]'));
    } catch {
      return new Set<number>();
    }
  }

  // Guarda só os ids que ainda existem, para a lista não crescer sem limite.
  private salvarAvisadas(avisadas: Set<number>, lista: Notificacao[]): void {
    const existentes = new Set(lista.map(n => n.id));
    const ids = [...avisadas].filter(id => existentes.has(id));
    try {
      sessionStorage.setItem(AVISADAS_KEY, JSON.stringify(ids));
    } catch {
      // sem sessionStorage o aviso pode se repetir ao recarregar; não é crítico
    }
  }
}
