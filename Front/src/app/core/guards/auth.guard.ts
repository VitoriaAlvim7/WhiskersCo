import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.estaLogado()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}

import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { SUPRIMIR_TOAST_ERRO } from '../http/toast.context';
import { mensagemDeErro } from '../../shared/utils/erro.utils';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toast: ToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const ehRotaDeAuth = req.url.includes('/auth/login') || req.url.includes('/auth/cadastro');

    let authReq = req.clone({ withCredentials: true });

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const tokenCsrf = lerCookie('XSRF-TOKEN');
      if (tokenCsrf) {
        authReq = authReq.clone({ setHeaders: { 'X-XSRF-TOKEN': tokenCsrf } });
      }
    }

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !ehRotaDeAuth) {
          localStorage.removeItem('wc_autenticado');
          localStorage.removeItem('wc_user');
          this.toast.erro('Sessão expirada. Faça login novamente.');
          this.router.navigate(['/login']);
          return throwError(() => err);
        }

        if (!req.context.get(SUPRIMIR_TOAST_ERRO)) {
          this.toast.erro(mensagemDeErro(err));
        }

        return throwError(() => err);
      })
    );
  }
}

function lerCookie(nome: string): string | null {
  const encontrado = document.cookie
    .split('; ')
    .find(linha => linha.startsWith(nome + '='));
  return encontrado ? decodeURIComponent(encontrado.substring(nome.length + 1)) : null;
}
