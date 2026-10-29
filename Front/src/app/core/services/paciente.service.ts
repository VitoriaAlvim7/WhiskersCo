import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paciente, Tutor, HistoricoMedico } from '../models';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private url = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Paciente[]>                              { return this.http.get<Paciente[]>(this.url); }
  buscarPorId(id: number, context?: HttpContext, incluirInativo = false): Observable<Paciente> {
    const params = incluirInativo ? new HttpParams().set('incluirInativo', true) : undefined;
    return this.http.get<Paciente>(`${this.url}/${id}`, { context, params });
  }
  criar(p: Paciente, context?: HttpContext): Observable<Paciente>      { return this.http.post<Paciente>(this.url, p, { context }); }
  atualizar(id: number, p: Paciente, context?: HttpContext): Observable<Paciente> { return this.http.put<Paciente>(`${this.url}/${id}`, p, { context }); }
  excluir(id: number): Observable<void>                         { return this.http.delete<void>(`${this.url}/${id}`); }
  historico(id: number): Observable<HistoricoMedico[]>          { return this.http.get<HistoricoMedico[]>(`${this.url}/${id}/historico`); }
}

@Injectable({ providedIn: 'root' })
export class TutorService {
  private url = `${environment.apiUrl}/tutores`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Tutor[]>                            { return this.http.get<Tutor[]>(this.url); }
  buscarPorId(id: number, context?: HttpContext): Observable<Tutor> { return this.http.get<Tutor>(`${this.url}/${id}`, { context }); }
  criar(t: Tutor, context?: HttpContext): Observable<Tutor>       { return this.http.post<Tutor>(this.url, t, { context }); }
  atualizar(id: number, t: Tutor, context?: HttpContext): Observable<Tutor> { return this.http.put<Tutor>(`${this.url}/${id}`, t, { context }); }
  excluir(id: number): Observable<void>                    { return this.http.delete<void>(`${this.url}/${id}`); }

  listarInativos(): Observable<Tutor[]>                    { return this.http.get<Tutor[]>(`${this.url}/inativos`); }
  reativar(id: number): Observable<void>                   { return this.http.put<void>(`${this.url}/${id}/reativar`, {}); }
}
