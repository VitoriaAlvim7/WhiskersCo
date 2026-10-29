import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmService, PedidoConfirmacao } from '../../../core/services/confirm.service';

const FOCAVEIS = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit, AfterViewChecked, OnDestroy {
  pedido: PedidoConfirmacao | null = null;

  @ViewChild('caixa') caixa?: ElementRef<HTMLElement>;
  @ViewChild('botaoCancelar') botaoCancelar?: ElementRef<HTMLButtonElement>;

  private inscricao?: Subscription;
  private focoAnterior: HTMLElement | null = null;
  private precisaFocar = false;

  constructor(private confirmService: ConfirmService) {}

  ngOnInit(): void {
    this.inscricao = this.confirmService.pedido$.subscribe(pedido => {
      const abrindo = !!pedido && !this.pedido;
      if (abrindo) this.focoAnterior = document.activeElement as HTMLElement | null;
      this.pedido = pedido;
      if (abrindo) this.precisaFocar = true;
      if (!pedido) this.devolverFoco();
    });
  }

  ngAfterViewChecked(): void {
    if (!this.precisaFocar || !this.botaoCancelar) return;
    this.precisaFocar = false;
    this.botaoCancelar.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.inscricao?.unsubscribe();
  }

  get textoConfirmar(): string {
    return this.pedido?.textoConfirmar ?? 'Excluir';
  }

  get textoCancelar(): string {
    return this.pedido?.textoCancelar ?? 'Cancelar';
  }

  get destrutivo(): boolean {
    return this.pedido?.destrutivo !== false;
  }

  confirmar(): void {
    this.confirmService.confirmar();
  }

  cancelar(): void {
    this.confirmService.cancelar();
  }

  @HostListener('document:keydown', ['$event'])
  aoTeclar(evento: KeyboardEvent): void {
    if (!this.pedido) return;

    if (evento.key === 'Escape') {
      evento.preventDefault();
      this.cancelar();
      return;
    }

    if (evento.key === 'Tab') this.prenderFoco(evento);
  }

  private prenderFoco(evento: KeyboardEvent): void {
    const caixa = this.caixa?.nativeElement;
    if (!caixa) return;

    const focaveis = Array.from(caixa.querySelectorAll<HTMLElement>(FOCAVEIS));
    if (!focaveis.length) return;

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const atual = document.activeElement;

    if (evento.shiftKey && (atual === primeiro || !caixa.contains(atual))) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && (atual === ultimo || !caixa.contains(atual))) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  private devolverFoco(): void {
    const alvo = this.focoAnterior;
    this.focoAnterior = null;
    if (alvo && document.contains(alvo)) alvo.focus();
  }
}
