import { Injectable } from '@angular/core';

export type Tema = 'claro' | 'escuro';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'wc_tema';

  aplicarTemaSalvo(): void {
    const tema = this.obterTema();
    this.aplicar(tema);
  }

  obterTema(): Tema {
    return (localStorage.getItem(this.KEY) as Tema) || 'claro';
  }

  alternar(): void {
    const novo: Tema = this.obterTema() === 'claro' ? 'escuro' : 'claro';
    localStorage.setItem(this.KEY, novo);
    this.aplicar(novo);
  }

  private aplicar(tema: Tema): void {
    if (tema === 'escuro') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
