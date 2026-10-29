import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReceituarioService, ConsultaService } from '../../core/services/services';
import { PacienteService, TutorService } from '../../core/services/paciente.service';
import { Receituario, Consulta } from '../../core/models';
import { contextoSemToast } from '../../core/http/toast.context';
import { mensagemDeErro } from '../../shared/utils/erro.utils';
import { ConfirmService } from '../../core/services/confirm.service';
import { fatiarPagina, paginaValida } from '../../shared/utils/paginacao.utils';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ReceitaService } from './receita.service';
import { ToastService } from '../../core/services/toast.service';
import { DadosReceita } from './receita.template';
import { hojeLocal } from '../../shared/utils/data.utils';

@Component({
  selector: 'app-receituarios',
  templateUrl: './receituarios.component.html',
  styleUrls: ['./receituarios.component.scss']
})
export class ReceituariosComponent implements OnInit {
  receituarios: Receituario[] = [];
  consultas: Consulta[] = [];
  busca = '';
  pagina = 1;
  filtrados: Receituario[] = [];

  carregando = true;
  erroCarregar = false;
  modalAberto = false;
  editando?: Receituario;
  salvando = false;
  erro = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private receituarioService: ReceituarioService,
    private consultaService: ConsultaService,
    private pacienteService: PacienteService,
    private tutorService: TutorService,
    private confirmService: ConfirmService,
    private receitaService: ReceitaService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      dataEmissao: ['', Validators.required],
      prescricao:  ['', Validators.required],
      consultaId:  ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.carregar();
    this.consultaService.listar().subscribe(c => this.consultas = c);
  }

  carregar(): void {
    this.carregando = true;
    this.erroCarregar = false;
    this.receituarioService.listar().subscribe({
      next: lista => { this.receituarios = lista; this.filtrar(false); this.carregando = false; },
      error: () => { this.carregando = false; this.erroCarregar = true; }
    });
  }

  filtrar(voltarAoInicio = true): void {
    const q = this.busca.toLowerCase();
    this.filtrados = q
      ? this.receituarios.filter(r => r.prescricao.toLowerCase().includes(q) || r.consulta?.toLowerCase().includes(q))
      : [...this.receituarios];
    this.pagina = voltarAoInicio ? 1 : paginaValida(this.pagina, this.filtrados.length);
  }

  get paginados(): Receituario[] {
    return fatiarPagina(this.filtrados, this.pagina);
  }

  abrirModal(r?: Receituario): void {
    this.editando = r;
    this.erro = '';
    this.form.reset({ dataEmissao: hojeLocal() });
    if (r) this.form.patchValue(r);
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.editando = undefined;
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = '';

    const dados: Receituario = this.form.value;
    const req$ = this.editando
      ? this.receituarioService.atualizar(this.editando.id!, dados, contextoSemToast())
      : this.receituarioService.criar(dados, contextoSemToast());

    req$.subscribe({
      next: () => { this.fecharModal(); this.carregar(); this.salvando = false; },
      error: (err) => { this.erro = mensagemDeErro(err); this.salvando = false; }
    });
  }

  excluir(id: number): void {
    this.confirmService.abrir({
      titulo: 'Excluir receituário',
      mensagem: 'Deseja excluir este receituário? A prescrição deixa de constar no histórico da consulta.'
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.receituarioService.excluir(id).subscribe(() => {
        this.receituarios = this.receituarios.filter(r => r.id !== id);
        this.filtrar(false);
      });
    });
  }

  // Só consultas finalizadas e ainda sem receita (ou a da receita em edição).
  get consultasElegiveis(): Consulta[] {
    return this.consultas.filter(c =>
      c.id === this.editando?.consultaId ||
      (c.status === 'FINALIZADA' && !c.receituario)
    );
  }

  consultaLabel(c: Consulta): string {
    const data = c.dataHora?.substring(0, 10).split('-').reverse().join('/');
    return `${data} · ${c.paciente} · ${c.motivo}`;
  }

  baixando?: number;

  private carregarDadosReceita(r: Receituario): Observable<DadosReceita> {
    return this.consultaService.buscarPorId(r.consultaId, contextoSemToast()).pipe(
      switchMap(consulta =>
        this.pacienteService.buscarPorId(consulta.pacienteId, contextoSemToast(), true).pipe(
          switchMap(paciente => {
            const endereco$ = paciente.tutorId
              ? this.tutorService.buscarPorId(paciente.tutorId, contextoSemToast()).pipe(
                  map(t => t.endereco || ''),
                  catchError(() => of(''))
                )
              : of('');
            return forkJoin({ enderecoTutor: endereco$ }).pipe(
              map(({ enderecoTutor }) => ({ receituario: r, consulta, paciente, enderecoTutor }))
            );
          })
        )
      )
    );
  }

  imprimir(r: Receituario): void {
    this.carregarDadosReceita(r).subscribe({
      next: dados => this.receitaService.imprimir(dados),
      error: () => this.avisarReceitaIndisponivel(),
    });
  }

  private avisarReceitaIndisponivel(): void {
    this.toast.aviso(
      'Não foi possível montar a receita: o paciente ou a consulta desta prescrição não está mais disponível.'
    );
  }

  baixar(r: Receituario): void {
    if (this.baixando === r.id) return;
    this.baixando = r.id;
    this.carregarDadosReceita(r).subscribe({
      next: dados => {
        this.receitaService.baixar(dados).finally(() => { this.baixando = undefined; });
      },
      error: () => { this.baixando = undefined; this.avisarReceitaIndisponivel(); }
    });
  }
}
