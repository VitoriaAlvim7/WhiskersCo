import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultaService, FuncionarioService, ReceituarioService } from '../../core/services/services';
import { PacienteService, TutorService } from '../../core/services/paciente.service';
import { Consulta, Paciente, Funcionario, StatusConsulta, Receituario } from '../../core/models';
import { ConfirmService } from '../../core/services/confirm.service';
import { RelatorioAgenda } from '../../core/models';
import { ITENS_POR_PAGINA } from '../../shared/utils/paginacao.utils';
import { contextoSemToast } from '../../core/http/toast.context';
import { mensagemDeErro } from '../../shared/utils/erro.utils';
import { ReceitaService } from '../receituarios/receita.service';
import { DadosReceita } from '../receituarios/receita.template';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ToastService } from '../../core/services/toast.service';
import { baixarRelatorioPdf, nomeArquivoRelatorio } from '../../shared/utils/relatorio-pdf.utils';

interface CalendarioMes {
  nome: string;
  ano: number;
  mes: number;
  semanas: (number | null)[][];
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss', './agenda-relatorio.component.scss']
})
export class AgendaComponent implements OnInit {
  consultas: Consulta[] = [];
  pacientes: Paciente[] = [];
  veterinarios: Funcionario[] = [];
  carregandoVeterinarios = true;
  meses: CalendarioMes[] = [];

  carregando = true;
  erroCarregar = false;

  pagina = 1;
  totalItens = 0;
  readonly tamanhoPagina = ITENS_POR_PAGINA;
  relatorio?: RelatorioAgenda;
  modalRelatorioAberto = false;

  modalAberto = false;
  salvando = false;
  erro = '';
  form: FormGroup;

  editando?: Consulta;

  detalhe?: Consulta;
  tutorDoDetalhe = '';
  carregandoDetalhe = false;
  private pacienteDoDetalhe?: Paciente;

  receitaAberta = false;
  prescricaoReceita = '';
  gerandoReceita = false;
  erroReceita = '';

  filtroDia = '';

  private offsetMeses = 0;
  private diasComConsulta = new Set<string>();

  statusOpcoes: { valor: StatusConsulta; label: string }[] = [
    { valor: 'AGENDADA', label: 'Agendada' },
    { valor: 'EM_ANDAMENTO', label: 'Em andamento' },
    { valor: 'FINALIZADA', label: 'Finalizada' },
    { valor: 'CANCELADA', label: 'Cancelada' },
  ];

  private NOMES_MESES = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];

  constructor(
    private fb: FormBuilder,
    private consultaService: ConsultaService,
    private pacienteService: PacienteService,
    private funcionarioService: FuncionarioService,
    private confirmService: ConfirmService,
    private receituarioService: ReceituarioService,
    private tutorService: TutorService,
    private receitaService: ReceitaService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      data:            ['', Validators.required],
      hora:            ['', Validators.required],
      motivo:          ['', Validators.required],
      pacienteId:      ['', Validators.required],
      funcionarioId:   ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.pacienteService.listar().subscribe(p => this.pacientes = p);
    this.funcionarioService.listar({ funcao: 'VETERINARIO', status: 'ATIVO' }).subscribe({
      next: f => { this.veterinarios = f; this.carregandoVeterinarios = false; },
      error: () => { this.carregandoVeterinarios = false; }
    });
    this.gerarCalendarios();
    this.route.queryParamMap.subscribe(p => {
      this.filtroDia = p.get('dia') ?? '';
      this.pagina = 1;
      this.carregar();
      this.carregarDiasComConsulta();
    });
  }

  get consultasVisiveis(): Consulta[] {
    return this.consultas;
  }

  limparFiltroDia(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  get filtroDiaFormatado(): string {
    return this.filtroDia.split('-').reverse().join('/');
  }

  private get mesReferencia(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth() + this.offsetMeses, 1);
  }

  private iso(d: Date): string {
    return d.toLocaleDateString('en-CA');
  }

  get intervalo(): { inicio: string; fim: string } {
    if (this.filtroDia) return { inicio: this.filtroDia, fim: this.filtroDia };
    const ref = this.mesReferencia;
    const ultimo = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    return { inicio: this.iso(ref), fim: this.iso(ultimo) };
  }

  get rotuloIntervalo(): string {
    const { inicio, fim } = this.intervalo;
    const br = (d: string) => d.split('-').reverse().join('/');
    return inicio === fim ? br(inicio) : `${this.meses[0]?.nome ?? ''} ${this.meses[0]?.ano ?? ''}`;
  }

  carregar(): void {
    this.carregando = true;
    this.erroCarregar = false;
    const { inicio, fim } = this.intervalo;

    this.consultaService.porPeriodo(inicio, fim, this.pagina, this.tamanhoPagina).subscribe({
      next: p => {
        this.consultas = p.conteudo;
        this.totalItens = p.totalItens;
        if (this.pagina > p.totalPaginas) { this.pagina = p.totalPaginas; this.carregar(); return; }
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.erroCarregar = true; }
    });

    this.consultaService.relatorio(inicio, fim).subscribe(r => {
      this.relatorio = r;
      this.diasComConsulta = new Set(r.consultas.map(c => c.dataHora.substring(0, 10)));
    });
  }

  private carregarDiasComConsulta(): void {
    const primeiro = this.meses[0];
    const ultimo = this.meses[this.meses.length - 1];
    if (!primeiro || !ultimo) return;
    const inicio = this.iso(new Date(primeiro.ano, primeiro.mes, 1));
    const fim = this.iso(new Date(ultimo.ano, ultimo.mes + 1, 0));
    this.consultaService.relatorio(inicio, fim).subscribe(r => {
      this.diasComConsulta = new Set(r.consultas.map(c => c.dataHora.substring(0, 10)));
    });
  }

  irParaPagina(pagina: number): void {
    this.pagina = pagina;
    this.carregar();
  }

  abrirRelatorio(): void { this.modalRelatorioAberto = true; }
  fecharRelatorio(): void { this.modalRelatorioAberto = false; }

  gerandoPdf = false;

  async baixarRelatorioPdf(): Promise<void> {
    const r = this.relatorio;
    if (!r || this.gerandoPdf) return;
    if (r.total === 0) {
      this.toast.aviso('Nenhum dado encontrado para os filtros informados.');
      return;
    }

    const br = (d: string) => d.split('-').reverse().join('/');
    const contar = (status: string) => r.porStatus[status] ?? 0;
    const periodo = r.inicio === r.fim
      ? br(r.inicio)
      : `${this.rotuloIntervalo} (${br(r.inicio)} a ${br(r.fim)})`;

    this.gerandoPdf = true;
    try {
      await baixarRelatorioPdf({
        titulo: 'Relatório da Agenda',
        periodo,
        resumo: [
          { rotulo: 'Consultas no período', valor: String(r.total) },
          { rotulo: 'Finalizadas', valor: String(contar('FINALIZADA')) },
          { rotulo: 'Agendadas', valor: String(contar('AGENDADA') + contar('EM_ANDAMENTO')), detalhe: 'inclui em andamento' },
          { rotulo: 'Canceladas', valor: String(contar('CANCELADA')) },
        ],
        tabelas: [
          {
            titulo: 'Consultas por status',
            colunas: [{ titulo: 'Status', largura: 0.75 }, { titulo: 'Quantidade', largura: 0.25, alinhar: 'right' }],
            linhas: this.porStatus.map(s => [this.statusLabel(s.chave), String(s.total)]),
            vazio: 'Sem consultas.',
          },
          {
            titulo: 'Consultas por veterinário',
            colunas: [{ titulo: 'Veterinário', largura: 0.75 }, { titulo: 'Quantidade', largura: 0.25, alinhar: 'right' }],
            linhas: this.porVeterinario.map(v => [v.chave, String(v.total)]),
            vazio: 'Sem consultas.',
          },
          {
            titulo: 'Todas as consultas',
            colunas: [
              { titulo: 'Data', largura: 0.13 },
              { titulo: 'Hora', largura: 0.08 },
              { titulo: 'Paciente', largura: 0.18 },
              { titulo: 'Veterinário', largura: 0.22 },
              { titulo: 'Motivo', largura: 0.24 },
              { titulo: 'Status', largura: 0.15 },
            ],
            linhas: r.consultas.map(c => [
              this.dataFormatada(c), this.horario(c), c.paciente ?? '', c.funcionario ?? '',
              c.motivo ?? '', this.statusLabel(c.status),
            ]),
            vazio: 'Nenhuma consulta no período.',
          },
        ],
        nomeArquivo: nomeArquivoRelatorio('agenda', r.inicio, r.fim),
      });
    } catch {
      this.toast.erro('Não foi possível gerar o PDF do relatório.');
    } finally {
      this.gerandoPdf = false;
    }
  }

  get porStatus(): { chave: string; total: number }[] {
    return Object.entries(this.relatorio?.porStatus ?? {}).map(([chave, total]) => ({ chave, total }));
  }

  get porVeterinario(): { chave: string; total: number }[] {
    return Object.entries(this.relatorio?.porVeterinario ?? {}).map(([chave, total]) => ({ chave, total }));
  }

  selecionarDia(mesInfo: CalendarioMes, dia: number | null): void {
    if (!dia) return;
    const chave = `${mesInfo.ano}-${String(mesInfo.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const destino = this.filtroDia === chave ? null : chave;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: destino ? { dia: destino } : {},
    });
  }

  diaSelecionado(mesInfo: CalendarioMes, dia: number | null): boolean {
    if (!dia) return false;
    const chave = `${mesInfo.ano}-${String(mesInfo.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return this.filtroDia === chave;
  }

  private gerarCalendarios(): void {
    this.meses = [];
    const hoje = new Date();
    for (let i = 0; i < 3; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + this.offsetMeses + i, 1);
      this.meses.push(this.buildMes(d.getFullYear(), d.getMonth()));
    }
  }

  mesAnterior(): void {
    this.offsetMeses--;
    this.aoMudarMes();
  }

  proximoMes(): void {
    this.offsetMeses++;
    this.aoMudarMes();
  }

  hoje(): void {
    this.offsetMeses = 0;
    this.aoMudarMes();
  }

  private aoMudarMes(): void {
    this.gerarCalendarios();
    this.pagina = 1;
    if (this.filtroDia) {
      this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    } else {
      this.carregar();
      this.carregarDiasComConsulta();
    }
  }

  private buildMes(ano: number, mes: number): CalendarioMes {
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias   = new Date(ano, mes + 1, 0).getDate();
    const semanas: (number | null)[][] = [];
    let semana: (number | null)[] = Array(primeiroDia).fill(null);

    for (let d = 1; d <= totalDias; d++) {
      semana.push(d);
      if (semana.length === 7) { semanas.push(semana); semana = []; }
    }
    if (semana.length) {
      while (semana.length < 7) semana.push(null);
      semanas.push(semana);
    }
    return { nome: this.NOMES_MESES[mes], ano, mes, semanas };
  }

  temConsulta(mesInfo: CalendarioMes, dia: number | null): boolean {
    if (!dia) return false;
    const chave = `${mesInfo.ano}-${String(mesInfo.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return this.diasComConsulta.has(chave);
  }

  abrirModal(c?: Consulta): void {
    this.editando = c;
    this.erro = '';
    this.form.reset();
    if (c) {
      this.form.patchValue({
        data: c.dataHora.substring(0, 10),
        hora: c.dataHora.substring(11, 16),
        motivo: c.motivo,
        pacienteId: c.pacienteId,
        funcionarioId: c.funcionarioId,
      });
    }
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.editando = undefined;
  }

  get veterinariosDoForm(): Funcionario[] {
    const atual = this.editando;
    if (!atual || this.veterinarios.some(v => v.id === atual.funcionarioId)) {
      return this.veterinarios;
    }
    const fora: Funcionario = {
      id: atual.funcionarioId,
      nome: `${atual.funcionario ?? 'Profissional'} (fora da lista de veterinários ativos)`,
      email: '',
      funcao: 'VETERINARIO',
      agenda: '',
      statusFuncionario: 'DESATIVADO',
    };
    return [fora, ...this.veterinarios];
  }

  abrirDetalhe(c: Consulta): void {
    this.detalhe = c;
    this.tutorDoDetalhe = '';
    this.pacienteDoDetalhe = undefined;
    this.cancelarReceita();
    this.carregandoDetalhe = true;
    this.pacienteService.buscarPorId(c.pacienteId, undefined, true).subscribe({
      next: p => {
        this.pacienteDoDetalhe = p;
        this.tutorDoDetalhe = p.tutorNome ?? '';
        this.carregandoDetalhe = false;
      },
      error: () => { this.carregandoDetalhe = false; }
    });
  }

  fecharDetalhe(): void {
    this.detalhe = undefined;
    this.cancelarReceita();
  }

  // UC Manter Consultas, A5: a receita nasce da propria consulta finalizada.
  podeGerarReceita(c: Consulta): boolean {
    return c.status === 'FINALIZADA' && !c.receituario;
  }

  abrirReceita(): void {
    this.prescricaoReceita = '';
    this.erroReceita = '';
    this.receitaAberta = true;
  }

  cancelarReceita(): void {
    this.receitaAberta = false;
    this.prescricaoReceita = '';
    this.erroReceita = '';
  }

  gerarReceita(): void {
    const consulta = this.detalhe;
    const prescricao = this.prescricaoReceita.trim();
    if (!consulta || !prescricao || this.gerandoReceita) return;

    this.gerandoReceita = true;
    this.erroReceita = '';
    const nova: Receituario = {
      dataEmissao: new Date().toLocaleDateString('en-CA'),
      prescricao,
      consultaId: consulta.id!,
    };

    this.receituarioService.criar(nova, contextoSemToast()).subscribe({
      next: salva => {
        consulta.receituario = { id: salva.id!, dataEmissao: salva.dataEmissao, prescricao: salva.prescricao };
        this.receitaAberta = false;
        this.gerandoReceita = false;
        this.carregar();
        this.baixarReceita(consulta);
      },
      error: err => { this.erroReceita = mensagemDeErro(err); this.gerandoReceita = false; }
    });
  }

  baixarReceita(c: Consulta): void {
    this.dadosReceita(c)?.subscribe(dados => this.receitaService.baixar(dados));
  }

  imprimirReceita(c: Consulta): void {
    this.dadosReceita(c)?.subscribe(dados => this.receitaService.imprimir(dados));
  }

  private dadosReceita(c: Consulta): Observable<DadosReceita> | undefined {
    const paciente = this.pacienteDoDetalhe;
    const resumo = c.receituario;
    if (!paciente || !resumo) return undefined;

    const receituario: Receituario = { ...resumo, consultaId: c.id!, consulta: c.motivo };
    const endereco$ = paciente.tutorId
      ? this.tutorService.buscarPorId(paciente.tutorId, contextoSemToast()).pipe(
          map(t => t.endereco || ''),
          catchError(() => of(''))
        )
      : of('');
    return endereco$.pipe(map(enderecoTutor => ({ receituario, consulta: c, paciente, enderecoTutor })));
  }

  editarDoDetalhe(c: Consulta): void {
    this.fecharDetalhe();
    this.abrirModal(c);
  }

  excluir(c: Consulta): void {
    this.confirmService.abrir({
      titulo: 'Excluir consulta',
      mensagem: `Excluir a consulta de ${c.paciente} em ${this.dataFormatada(c)} às ${this.horario(c)}?`,
      aviso: c.receituario
        ? 'O receituário emitido nesta consulta será apagado junto e não pode ser recuperado.'
        : undefined,
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.consultaService.excluir(c.id!).subscribe(() => {
        this.fecharDetalhe();
        this.carregar();
      });
    });
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = '';

    const v = this.form.value;
    const dados: Consulta = {
      dataHora: `${v.data}T${v.hora}:00`,
      motivo: v.motivo,
      pacienteId: v.pacienteId,
      funcionarioId: v.funcionarioId,
    };

    const req$ = this.editando
      ? this.consultaService.atualizar(this.editando.id!, dados, contextoSemToast())
      : this.consultaService.criar(dados, contextoSemToast());

    req$.subscribe({
      next: () => { this.fecharModal(); this.salvando = false; this.carregar(); },
      error: (err) => { this.erro = mensagemDeErro(err); this.salvando = false; }
    });
  }

  atualizarStatus(c: Consulta, status: StatusConsulta): void {
    this.consultaService.atualizarStatus(c.id!, status).subscribe(() => this.carregar());
  }

  get dataNoPassado(): boolean {
    const { data, hora } = this.form.value;
    if (!data || !hora) return false;
    return new Date(`${data}T${hora}`) < new Date();
  }

  podeFinalizar(c: Consulta): boolean {
    return c.status === 'AGENDADA' || c.status === 'EM_ANDAMENTO';
  }

  finalizar(c: Consulta): void {
    this.consultaService.atualizarStatus(c.id!, 'FINALIZADA').subscribe({
      next: () => this.router.navigate(['/caixa'], { queryParams: { consultaId: c.id } }),
      error: () => this.carregar(),
    });
  }

  horario(c: Consulta): string {
    return c.dataHora?.substring(11, 16) ?? '';
  }

  dataFormatada(c: Consulta): string {
    return c.dataHora?.substring(0, 10).split('-').reverse().join('/') ?? '';
  }

  dataReceita(iso?: string): string {
    return iso?.split('-')?.reverse()?.join('/') ?? '';
  }

  statusLabel(status?: StatusConsulta | string): string {
    return this.statusOpcoes.find(s => s.valor === status)?.label ?? status ?? '';
  }
}
