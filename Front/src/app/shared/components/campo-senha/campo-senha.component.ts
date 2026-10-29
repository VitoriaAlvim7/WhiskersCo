import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-campo-senha',
  templateUrl: './campo-senha.component.html',
  styleUrls: ['./campo-senha.component.scss'],
  host: { '[attr.id]': 'null' },
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CampoSenhaComponent),
    multi: true,
  }],
})
export class CampoSenhaComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() placeholder = '';
  @Input() autocomplete: 'current-password' | 'new-password' = 'current-password';

  valor = '';
  visivel = false;
  desabilitado = false;

  private aoMudar: (valor: string) => void = () => {};
  private aoTocar: () => void = () => {};

  writeValue(valor: string): void {
    this.valor = valor ?? '';
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado = desabilitado;
  }

  digitou(evento: Event): void {
    this.valor = (evento.target as HTMLInputElement).value;
    this.aoMudar(this.valor);
  }

  tocou(): void {
    this.aoTocar();
  }

  alternarVisibilidade(): void {
    this.visivel = !this.visivel;
  }
}
