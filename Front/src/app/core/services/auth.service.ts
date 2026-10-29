import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, Usuario } from '../models';
import { contextoSemToast } from '../http/toast.context';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USER_KEY = 'wc_user';
  private readonly AUTENTICADO_KEY = 'wc_autenticado';

  private loggedIn$ = new BehaviorSubject<boolean>(this.estaLogado());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials, { context: contextoSemToast() })
      .pipe(
        tap(res => {
          localStorage.setItem(this.AUTENTICADO_KEY, '1');
          localStorage.setItem(this.USER_KEY, JSON.stringify({ id: res.id, nome: res.nome, email: res.email }));
          this.loggedIn$.next(true);
        })
      );
  }

  cadastro(usuario: Usuario): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/cadastro`, usuario, { context: contextoSemToast() })
      .pipe(
        tap(res => {
          localStorage.setItem(this.AUTENTICADO_KEY, '1');
          localStorage.setItem(this.USER_KEY, JSON.stringify({ id: res.id, nome: res.nome, email: res.email }));
          this.loggedIn$.next(true);
        })
      );
  }

  logout(): void {
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {}, { context: contextoSemToast() })
      .pipe(
        finalize(() => {
          localStorage.removeItem(this.AUTENTICADO_KEY);
          localStorage.removeItem(this.USER_KEY);
          this.loggedIn$.next(false);
          this.router.navigate(['/login']);
        })
      )
      .subscribe();
  }

  // Confirma no back quem está logado e corrige o que ficou guardado no navegador.
  sincronizarUsuario(): Observable<AuthResponse> {
    return this.http
      .get<AuthResponse>(`${environment.apiUrl}/auth/me`, { context: contextoSemToast() })
      .pipe(tap(res => this.atualizarUsuarioLocal({ id: res.id, nome: res.nome, email: res.email })));
  }

  atualizarUsuarioLocal(dados: Partial<Usuario>): void {
    const atual = this.getUsuario() ?? {};
    localStorage.setItem(this.USER_KEY, JSON.stringify({ ...atual, ...dados }));
  }

  getUsuario(): Partial<Usuario> | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  estaLogado(): boolean {
    return localStorage.getItem(this.AUTENTICADO_KEY) === '1';
  }
}
