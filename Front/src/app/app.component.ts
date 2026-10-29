import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../environments/environment';
import { ThemeService } from './core/services/theme.service';
import { contextoSemToast } from './core/http/toast.context';
import { AuthService } from './core/services/auth.service';
import { NotificacaoService } from './core/services/notificacao.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  anuncioDeRota = '';

  constructor(
    private theme: ThemeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private title: Title,
    private http: HttpClient,
    private auth: AuthService,
    private notificacoes: NotificacaoService
  ) {}

  ngOnInit(): void {
    this.theme.aplicarTemaSalvo();

    this.http.get(`${environment.apiUrl}/auth/csrf`, { context: contextoSemToast() }).subscribe();

    this.auth.isLoggedIn().subscribe(logado => {
      if (logado) {
        this.notificacoes.iniciarMonitoramento(() => this.auth.estaLogado());
      } else {
        this.notificacoes.pararMonitoramento();
      }
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const titulo = this.tituloDaRotaAtual();
      if (!titulo) return;

      this.title.setTitle(`${titulo} · Whiskers & Co.`);
      this.anuncioDeRota = `${titulo}${this.anuncioDeRota.endsWith(' ') ? '' : ' '}`;
    });
  }

  private tituloDaRotaAtual(): string | null {
    let rota = this.activatedRoute;
    while (rota.firstChild) rota = rota.firstChild;
    return rota.snapshot.data['titulo'] ?? null;
  }

  pularParaConteudo(evento: Event): void {
    evento.preventDefault();
    document.getElementById('conteudo-principal')?.focus();
  }
}
