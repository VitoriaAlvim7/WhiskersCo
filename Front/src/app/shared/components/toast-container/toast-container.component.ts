import { Component } from '@angular/core';
import { NomeIcone } from '../icon/icon.component';
import { ToastService, TipoToast } from '../../../core/services/toast.service';

const ICONE_POR_TIPO: Record<TipoToast, NomeIcone> = {
  sucesso: 'sucesso',
  erro: 'alerta',
  aviso: 'alerta',
  info: 'informacao',
};

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent {
  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  icone(tipo: TipoToast): NomeIcone {
    return ICONE_POR_TIPO[tipo];
  }

  fechar(id: number): void {
    this.toastService.fechar(id);
  }
}
