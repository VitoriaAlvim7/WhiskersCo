import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService, Tema } from '../../core/services/theme.service';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent {
  constructor(private auth: AuthService, private theme: ThemeService) {}

  temaAtual(): Tema {
    return this.theme.obterTema();
  }

  alternarTema(): void {
    this.theme.alternar();
  }

  sair(): void {
    this.auth.logout();
  }
}
