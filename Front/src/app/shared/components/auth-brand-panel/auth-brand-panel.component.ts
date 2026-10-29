import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-brand-panel',
  templateUrl: './auth-brand-panel.component.html',
  styleUrls: ['./auth-brand-panel.component.scss']
})
export class AuthBrandPanelComponent {
  recursos = [
    {
      icone: 'calendario' as const,
      titulo: 'Agenda sem conflitos',
      descricao: 'Consultas e retornos organizados por veterinário.'
    },
    {
      icone: 'pata' as const,
      titulo: 'Prontuário completo',
      descricao: 'Histórico, alergias e receituários de cada paciente.'
    },
    {
      icone: 'coracao' as const,
      titulo: 'Cuidado registrado',
      descricao: 'Da adoção ao check-up, nada se perde.'
    },
  ];
}
