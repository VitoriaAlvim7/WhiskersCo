import { Component, Input } from '@angular/core';

export type NomeIcone =
  | 'fechar'
  | 'pata'
  | 'pessoa'
  | 'calendario'
  | 'valores'
  | 'estoque'
  | 'sol'
  | 'lua'
  | 'chevron'
  | 'chevron-esquerda'
  | 'chevron-direita'
  | 'seta-esquerda'
  | 'lixeira'
  | 'baixar'
  | 'imprimir'
  | 'editar'
  | 'coracao'
  | 'olho'
  | 'olho-fechado'
  | 'sucesso'
  | 'alerta'
  | 'informacao';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  @Input() nome: NomeIcone = 'fechar';
  @Input() tamanho = 20;
}
