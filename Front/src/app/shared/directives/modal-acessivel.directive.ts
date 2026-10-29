import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, OnDestroy, OnInit, Output } from '@angular/core';

const FOCAVEIS = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const pilhaDeModais: ModalAcessivelDirective[] = [];

@Directive({
  selector: '[appModalAcessivel]',
})
export class ModalAcessivelDirective implements OnInit, OnDestroy {
  @Output() fechar = new EventEmitter<void>();

  @HostBinding('attr.role') readonly role = 'dialog';
  @HostBinding('attr.aria-modal') readonly ariaModal = 'true';

  private focoAnterior: HTMLElement | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.focoAnterior = document.activeElement as HTMLElement | null;
    pilhaDeModais.push(this);
    setTimeout(() => this.focarPrimeiro());
  }

  ngOnDestroy(): void {
    const indice = pilhaDeModais.indexOf(this);
    if (indice !== -1) pilhaDeModais.splice(indice, 1);

    const alvo = this.focoAnterior;
    this.focoAnterior = null;
    if (alvo && document.contains(alvo)) alvo.focus();
  }

  @HostListener('document:keydown', ['$event'])
  aoTeclar(evento: KeyboardEvent): void {
    if (pilhaDeModais[pilhaDeModais.length - 1] !== this) return;

    if (evento.key === 'Escape') {
      evento.preventDefault();
      this.fechar.emit();
      return;
    }

    if (evento.key === 'Tab') this.prenderFoco(evento);
  }

  private focarPrimeiro(): void {
    this.el.nativeElement.querySelector<HTMLElement>(FOCAVEIS)?.focus();
  }

  private prenderFoco(evento: KeyboardEvent): void {
    const caixa = this.el.nativeElement;
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
}
