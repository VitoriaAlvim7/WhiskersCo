import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent {
  @Input() rotaFallback = '/dashboard';
  @Input() rotulo = 'Voltar';

  constructor(private location: Location, private router: Router) {}

  voltar(): void {
    if (this.temHistoricoInterno()) {
      this.location.back();
    } else {
      this.router.navigate([this.rotaFallback]);
    }
  }

  private temHistoricoInterno(): boolean {
    const state = this.location.getState() as { navigationId?: number } | null;
    return !!state && typeof state.navigationId === 'number' && state.navigationId > 1;
  }
}
