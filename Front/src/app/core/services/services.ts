import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Consulta, Funcionario, FuncaoFuncionario, StatusFuncionario, Produto, AnimalAdocao, Receituario, TransacaoCaixa, ItemTransacao, PaginaDe, RelatorioCaixa, RelatorioAgenda } from '../models';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private url = `${environment.apiUrl}/consultas`;
  constructor(private http: HttpClient) {}

  listar(): Observable<Consulta[]>                                { return this.http.get<Consulta[]>(this.url); }
  listarHoje(): Observable<Consulta[]>                            { return this.http.get<Consulta[]>(`${this.url}/hoje`); }
  buscarPorId(id: number, context?: HttpContext): Observable<Consulta> { return this.http.get<Consulta>(`${this.url}/${id}`, { context }); }
  criar(c: Consulta, context?: HttpContext): Observable<Consulta>                    { return this.http.post<Consulta>(this.url, c, { context }); }
  atualizar(id: number, c: Consulta, context?: HttpContext): Observable<Consulta>    { return this.http.put<Consulta>(`${this.url}/${id}`, c, { context }); }
  atualizarStatus(id: number, status: string): Observable<Consulta> {
    return this.http.patch<Consulta>(`${this.url}/${id}/status`, { status });
  }
  excluir(id: number): Observable<void>                           { return this.http.delete<void>(`${this.url}/${id}`); }

  porPeriodo(inicio: string, fim: string, pagina: number, tamanho: number): Observable<PaginaDe<Consulta>> {
    const params = new HttpParams()
      .set('inicio', inicio).set('fim', fim)
      .set('pagina', pagina - 1).set('tamanho', tamanho);
    return this.http.get<PaginaDe<Consulta>>(`${this.url}/periodo`, { params });
  }

  relatorio(inicio: string, fim: string): Observable<RelatorioAgenda> {
    const params = new HttpParams().set('inicio', inicio).set('fim', fim);
    return this.http.get<RelatorioAgenda>(`${this.url}/relatorio`, { params });
  }
}

@Injectable({ providedIn: 'root' })
export class FuncionarioService {
  private url = `${environment.apiUrl}/funcionarios`;
  constructor(private http: HttpClient) {}

  listar(filtros?: { funcao?: FuncaoFuncionario; status?: StatusFuncionario }): Observable<Funcionario[]> {
    let params = new HttpParams();
    if (filtros?.funcao) params = params.set('funcao', filtros.funcao);
    if (filtros?.status) params = params.set('status', filtros.status);
    return this.http.get<Funcionario[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<Funcionario>                   { return this.http.get<Funcionario>(`${this.url}/${id}`); }
  criar(f: Funcionario, context?: HttpContext): Observable<Funcionario>                 { return this.http.post<Funcionario>(this.url, f, { context }); }
  atualizar(id: number, f: Funcionario, context?: HttpContext): Observable<Funcionario> { return this.http.put<Funcionario>(`${this.url}/${id}`, f, { context }); }
  excluir(id: number): Observable<void>                              { return this.http.delete<void>(`${this.url}/${id}`); }
  alterarSenha(id: number, senhaAtual: string, novaSenha: string, context?: HttpContext): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/senha`, { senhaAtual, novaSenha }, { context });
  }
}

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  private url = `${environment.apiUrl}/produtos`;
  constructor(private http: HttpClient) {}

  listar(): Observable<Produto[]>                                { return this.http.get<Produto[]>(this.url); }
  buscarPorId(id: number): Observable<Produto>                   { return this.http.get<Produto>(`${this.url}/${id}`); }
  criar(p: Produto, context?: HttpContext): Observable<Produto>                { return this.http.post<Produto>(this.url, p, { context }); }
  atualizar(id: number, p: Produto, context?: HttpContext): Observable<Produto> { return this.http.put<Produto>(`${this.url}/${id}`, p, { context }); }
  excluir(id: number): Observable<void>                          { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class AdocaoService {
  private url = `${environment.apiUrl}/animais-adocao`;
  constructor(private http: HttpClient) {}

  listar(): Observable<AnimalAdocao[]>                                 { return this.http.get<AnimalAdocao[]>(this.url); }
  buscarPorId(id: number): Observable<AnimalAdocao>                    { return this.http.get<AnimalAdocao>(`${this.url}/${id}`); }
  criar(a: AnimalAdocao, context?: HttpContext): Observable<AnimalAdocao>     { return this.http.post<AnimalAdocao>(this.url, a, { context }); }
  atualizar(id: number, a: AnimalAdocao, context?: HttpContext): Observable<AnimalAdocao> { return this.http.put<AnimalAdocao>(`${this.url}/${id}`, a, { context }); }
  excluir(id: number): Observable<void>                                { return this.http.delete<void>(`${this.url}/${id}`); }
  adotar(animalId: number, tutorId: number, context?: HttpContext): Observable<any> {
    return this.http.post<any>(`${this.url}/${animalId}/adotar`, { tutorId }, { context });
  }
}

@Injectable({ providedIn: 'root' })
export class ReceituarioService {
  private url = `${environment.apiUrl}/receituarios`;
  constructor(private http: HttpClient) {}

  listar(): Observable<Receituario[]>                                { return this.http.get<Receituario[]>(this.url); }
  buscarPorId(id: number): Observable<Receituario>                   { return this.http.get<Receituario>(`${this.url}/${id}`); }
  criar(r: Receituario, context?: HttpContext): Observable<Receituario>     { return this.http.post<Receituario>(this.url, r, { context }); }
  atualizar(id: number, r: Receituario, context?: HttpContext): Observable<Receituario> { return this.http.put<Receituario>(`${this.url}/${id}`, r, { context }); }
  excluir(id: number): Observable<void>                              { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class CaixaService {
  private url = `${environment.apiUrl}/transacoes-caixa`;
  constructor(private http: HttpClient) {}

  listar(): Observable<TransacaoCaixa[]>                             { return this.http.get<TransacaoCaixa[]>(this.url); }
  buscarPorId(id: number): Observable<TransacaoCaixa>                { return this.http.get<TransacaoCaixa>(`${this.url}/${id}`); }
  criar(t: TransacaoCaixa, context?: HttpContext): Observable<TransacaoCaixa> { return this.http.post<TransacaoCaixa>(this.url, t, { context }); }
  atualizar(id: number, t: TransacaoCaixa): Observable<TransacaoCaixa> { return this.http.put<TransacaoCaixa>(`${this.url}/${id}`, t); }
  excluir(id: number): Observable<void>                               { return this.http.delete<void>(`${this.url}/${id}`); }
  totalPorTipo(tipo: 'ENTRADA' | 'SAIDA'): Observable<number>         { return this.http.get<number>(`${this.url}/total/tipo/${tipo}`); }

  porPeriodo(inicio: string, fim: string, pagina: number, tamanho: number): Observable<PaginaDe<TransacaoCaixa>> {
    const params = new HttpParams()
      .set('inicio', inicio).set('fim', fim)
      .set('pagina', pagina - 1).set('tamanho', tamanho);
    return this.http.get<PaginaDe<TransacaoCaixa>>(`${this.url}/periodo`, { params });
  }

  relatorio(inicio: string, fim: string): Observable<RelatorioCaixa> {
    const params = new HttpParams().set('inicio', inicio).set('fim', fim);
    return this.http.get<RelatorioCaixa>(`${this.url}/relatorio`, { params });
  }
}

@Injectable({ providedIn: 'root' })
export class ItemTransacaoService {
  private url = `${environment.apiUrl}/itens-transacao`;
  constructor(private http: HttpClient) {}

  buscarPorId(id: number): Observable<ItemTransacao>  { return this.http.get<ItemTransacao>(`${this.url}/${id}`); }
  excluir(id: number): Observable<void>                { return this.http.delete<void>(`${this.url}/${id}`); }
}
