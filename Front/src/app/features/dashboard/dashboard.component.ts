import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConsultaService, FuncionarioService, EstoqueService } from '../../core/services/services';
import { ArquivoService } from '../../core/services/arquivo.service';
import { AuthService } from '../../core/services/auth.service';
import { PacienteService, TutorService } from '../../core/services/paciente.service';
import { Consulta, Paciente, Funcionario, Notificacao, TipoNotificacao, Tutor, Produto, TipoServico } from '../../core/models';
import { PacienteFormModalComponent } from '../../shared/components/paciente-form-modal/paciente-form-modal.component';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { NomeIcone } from '../../shared/components/icon/icon.component';
import { contextoSemToast } from '../../core/http/toast.context';
import { mensagemDeErro } from '../../shared/utils/erro.utils';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss', './dashboard-menus.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  consultas: Consulta[] = [];
  pacientes: Paciente[] = [];
  veterinarios: Funcionario[] = [];
  carregandoVeterinarios = true;

  readonly hojeIso = new Date().toLocaleDateString('en-CA');
  totalPacientes = 0;
  totalAgendamentos = 0;
  totalEstoque = 0;
  usuarioNome = '';
  usuarioEmail = '';
  usuarioFoto: string | null = null;
  modalAberto = false;
  salvando = false;
  erro = '';
  form: FormGroup;
  notificacoesAberto = false;
  perfilAberto = false;

  notificacoes: Notificacao[] = [];
  naoLidas = 0;
  modalNotificacoesAberto = false;
  private inscricaoNotificacoes?: Subscription;

  servicos: Produto[] = [];
  modalValoresAberto = false;

  private readonly TIPO_SERVICO_LABELS: Record<TipoServico, string> = {
    CONSULTA: 'Consulta',
    CIRURGIA: 'Cirurgia',
    VACINACAO: 'Vacinação',
    BANHO_TOSA: 'Banho e tosa',
    EXAME: 'Exame',
    OUTRO: 'Outro',
  };

  private readonly ICONE_POR_TIPO: Record<TipoNotificacao, NomeIcone> = {
    PACIENTE_CADASTRADO: 'pata',
    CONSULTA_AGENDADA: 'calendario',
    ESTOQUE_BAIXO: 'estoque',
    CONSULTA_PROXIMA: 'alerta',
  };

  private readonly NO_MENU = 5;

  tutores: Tutor[] = [];
  modalPacienteAberto = false;
  modalTutorAberto = false;

  @ViewChild(PacienteFormModalComponent) formPaciente?: PacienteFormModalComponent;

  private STATUS_LABELS: Record<string, string> = {
    AGENDADA: 'Agendada',
    EM_ANDAMENTO: 'Em andamento',
    FINALIZADA: 'Finalizada',
    CANCELADA: 'Cancelada',
  };

  constructor(
    private fb: FormBuilder,
    private consultaService: ConsultaService,
    private pacienteService: PacienteService,
    private funcionarioService: FuncionarioService,
    private estoqueService: EstoqueService,
    private auth: AuthService,
    private tutorService: TutorService,
    private notificacaoService: NotificacaoService,
    private confirmService: ConfirmService,
    private arquivoService: ArquivoService
  ) {
    this.form = this.fb.group({
      pacienteId:    ['', Validators.required],
      funcionarioId: ['', Validators.required],
      data:          ['', Validators.required],
      horario:       ['', Validators.required],
      motivo:        ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const u = this.auth.getUsuario();
    this.usuarioNome = u?.nome ?? '';
    this.usuarioEmail = u?.email ?? '';
    this.auth.sincronizarUsuario().subscribe(atual => {
      this.usuarioNome = atual.nome;
      this.usuarioEmail = atual.email;
      if (!atual.id) return;
      this.funcionarioService.buscarPorId(atual.id).subscribe(f => {
        this.usuarioFoto = this.arquivoService.urlAbsoluta(f.fotoUrl) || null;
      });
    });

    this.consultaService.listarHoje().subscribe(c => {
      this.consultas = c;
      this.totalAgendamentos = c.length;
    });

    this.pacienteService.listar().subscribe(p => {
      this.pacientes = p;
      this.totalPacientes = p.length;
    });

    this.tutorService.listar().subscribe(t => this.tutores = t);

    this.funcionarioService.listar({ funcao: 'VETERINARIO', status: 'ATIVO' }).subscribe({
      next: f => { this.veterinarios = f; this.carregandoVeterinarios = false; },
      error: () => { this.carregandoVeterinarios = false; }
    });

    this.estoqueService.listar().subscribe(prod => {
      this.totalEstoque = prod.length;
      this.servicos = prod.filter(p => p.naturezaItem === 'SERVICO');
    });

    // A lista vem do monitoramento global, que já consulta o back periodicamente.
    this.inscricaoNotificacoes = this.notificacaoService.lista$.subscribe(lista => {
      this.notificacoes = lista;
      this.naoLidas = lista.filter(n => !n.lida).length;
    });
    this.carregarNotificacoes();
  }

  ngOnDestroy(): void {
    this.inscricaoNotificacoes?.unsubscribe();
  }

  carregarNotificacoes(): void {
    this.notificacaoService.atualizarAgora();
  }

  abrirValores(): void { this.modalValoresAberto = true; }
  fecharValores(): void { this.modalValoresAberto = false; }

  tipoServicoLabel(tipo?: TipoServico | null): string {
    return tipo ? this.TIPO_SERVICO_LABELS[tipo] : '—';
  }

  moeda(valor?: number | null): string {
    return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get notificacoesDoMenu(): Notificacao[] {
    return this.notificacoes.slice(0, this.NO_MENU);
  }

  icone(tipo: TipoNotificacao): NomeIcone {
    return this.ICONE_POR_TIPO[tipo] ?? 'informacao';
  }

  quando(criadaEm: string): string {
    const minutos = Math.floor((Date.now() - new Date(criadaEm).getTime()) / 60000);
    if (minutos < 1) return 'agora';
    if (minutos < 60) return `há ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas} h`;
    const dias = Math.floor(horas / 24);
    return dias === 1 ? 'ontem' : `há ${dias} dias`;
  }

  marcarTodasComoVistas(): void {
    if (this.naoLidas === 0) return;
    this.notificacaoService.marcarTodasComoLidas().subscribe(() => this.carregarNotificacoes());
  }

  excluirNotificacao(n: Notificacao): void {
    this.confirmService.abrir({
      titulo: 'Excluir notificação',
      mensagem: `Remover "${n.titulo}" da lista?`,
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.notificacaoService.excluir(n.id).subscribe(() => this.carregarNotificacoes());
    });
  }

  abrirTodasNotificacoes(): void {
    this.fecharMenus();
    this.modalNotificacoesAberto = true;
  }

  fecharTodasNotificacoes(): void {
    this.modalNotificacoesAberto = false;
  }

  abrirNovaConsulta(): void {
    this.erro = '';
    this.form.reset();
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  abrirNovoPaciente(): void {
    this.modalPacienteAberto = true;
  }

  fecharNovoPaciente(): void {
    this.modalPacienteAberto = false;
  }

  aoSalvarPaciente(novo: Paciente): void {
    this.fecharNovoPaciente();
    this.pacienteService.listar().subscribe(lista => {
      this.pacientes = lista;
      this.totalPacientes = lista.length;
      if (novo?.id) this.form.patchValue({ pacienteId: novo.id });
    });
  }

  abrirNovoTutor(): void {
    this.modalTutorAberto = true;
  }

  fecharNovoTutor(): void {
    this.modalTutorAberto = false;
  }

  aoSalvarTutor(novo: Tutor): void {
    this.fecharNovoTutor();
    this.tutorService.listar().subscribe(lista => {
      this.tutores = lista;
      if (novo?.id) this.formPaciente?.selecionarTutor(novo.id);
    });
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = '';

    const v = this.form.value;
    const dados: Consulta = {
      dataHora: `${v.data}T${v.horario}:00`,
      motivo: v.motivo,
      pacienteId: v.pacienteId,
      funcionarioId: v.funcionarioId,
    };

    this.consultaService.criar(dados, contextoSemToast()).subscribe({
      next: () => {
        this.fecharModal();
        this.salvando = false;
        this.consultaService.listarHoje().subscribe(c => {
          this.consultas = c;
          this.totalAgendamentos = c.length;
        });
      },
      error: (err) => {
        this.erro = mensagemDeErro(err);
        this.salvando = false;
      }
    });
  }

  abrirNotificacoes(): void {
    this.notificacoesAberto = !this.notificacoesAberto;
    this.perfilAberto = false;
  }

  abrirPerfil(): void {
    this.perfilAberto = !this.perfilAberto;
    this.notificacoesAberto = false;
  }

  fecharMenus(): void {
    this.notificacoesAberto = false;
    this.perfilAberto = false;
  }

  logout(): void {
    this.auth.logout();
  }

  statusLabel(status?: string): string {
    return status ? (this.STATUS_LABELS[status] ?? status) : '';
  }
}
