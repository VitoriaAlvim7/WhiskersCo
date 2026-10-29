import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuncionarioService } from '../../core/services/services';
import { DiaSemana, FaixaAgenda, Funcionario } from '../../core/models';
import { contextoSemToast } from '../../core/http/toast.context';
import { mensagemDeErro } from '../../shared/utils/erro.utils';
import { ConfirmService } from '../../core/services/confirm.service';
import { fatiarPagina, paginaValida } from '../../shared/utils/paginacao.utils';
import { ArquivoService } from '../../core/services/arquivo.service';

@Component({
  selector: 'app-funcionarios',
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.scss']
})
export class FuncionariosComponent implements OnInit {
  funcionarios: Funcionario[] = [];
  pagina = 1;
  carregando = true;
  erroCarregar = false;
  modalAberto = false;
  editando?: Funcionario;
  salvando = false;
  erro = '';

  form: FormGroup;

  private FUNCAO_LABELS: Record<string, string> = {
    GERENTE: 'Gerente',
    VETERINARIO: 'Veterinário(a)',
    RECEPCIONISTA: 'Recepcionista',
    AUXILIAR: 'Auxiliar',
  };

  funcaoLabel(f: string): string {
    return this.FUNCAO_LABELS[f] ?? f;
  }

  constructor(
    private fb: FormBuilder,
    private funcionarioService: FuncionarioService,
    private confirmService: ConfirmService,
    private arquivoService: ArquivoService
  ) {
    this.form = this.fb.group({
      nome:              ['', Validators.required],
      funcao:            ['RECEPCIONISTA', Validators.required],

      statusFuncionario: ['ATIVO'],
      email:             ['', [Validators.required, Validators.email]],
      senha:             [''],
      fotoUrl:           [null as string | null],
      agenda:            this.fb.array([]),
    });
  }

  readonly diasDaSemana: { valor: DiaSemana; rotulo: string }[] = [
    { valor: 'MONDAY', rotulo: 'Segunda' },
    { valor: 'TUESDAY', rotulo: 'Terça' },
    { valor: 'WEDNESDAY', rotulo: 'Quarta' },
    { valor: 'THURSDAY', rotulo: 'Quinta' },
    { valor: 'FRIDAY', rotulo: 'Sexta' },
    { valor: 'SATURDAY', rotulo: 'Sábado' },
    { valor: 'SUNDAY', rotulo: 'Domingo' },
  ];

  get agenda(): FormArray {
    return this.form.get('agenda') as FormArray;
  }

  private montarAgenda(faixas: FaixaAgenda[] = []): void {
    if (this.agenda.length !== this.diasDaSemana.length) {
      this.agenda.clear();
      for (const dia of this.diasDaSemana) {
        this.agenda.push(this.fb.group({
          diaSemana: [dia.valor], atende: [false], horaInicio: ['08:00'], horaFim: ['18:00'],
        }));
      }
    }
    this.diasDaSemana.forEach((dia, i) => {
      const existente = faixas.find(f => f.diaSemana === dia.valor);
      this.agenda.at(i).patchValue({
        diaSemana: dia.valor,
        atende: !!existente,
        horaInicio: existente ? existente.horaInicio.substring(0, 5) : '08:00',
        horaFim: existente ? existente.horaFim.substring(0, 5) : '18:00',
      });
    });
  }

  resumoAgenda(faixas: FaixaAgenda[] | undefined): string {
    if (!faixas?.length) return '—';
    const curto: Record<string, string> = {
      MONDAY: 'Seg', TUESDAY: 'Ter', WEDNESDAY: 'Qua', THURSDAY: 'Qui',
      FRIDAY: 'Sex', SATURDAY: 'Sáb', SUNDAY: 'Dom',
    };
    const ordem = this.diasDaSemana.map(d => d.valor as string);
    const porHorario = new Map<string, number[]>();
    for (const f of faixas) {
      const chave = `${f.horaInicio.substring(0, 5)}–${f.horaFim.substring(0, 5)}`;
      const dias = porHorario.get(chave) ?? [];
      dias.push(ordem.indexOf(f.diaSemana));
      porHorario.set(chave, dias);
    }
    const partes: string[] = [];
    porHorario.forEach((dias, horario) => {
      dias.sort((a, b) => a - b);
      const blocos: string[] = [];
      let inicio = dias[0], anterior = dias[0];
      const fechar = () => {
        const n = anterior - inicio + 1;
        if (n >= 3) blocos.push(`${curto[ordem[inicio]]} a ${curto[ordem[anterior]]}`);
        else for (let d = inicio; d <= anterior; d++) blocos.push(curto[ordem[d]]);
      };
      for (const d of dias.slice(1)) {
        if (d === anterior + 1) { anterior = d; continue; }
        fechar(); inicio = anterior = d;
      }
      fechar();
      partes.push(`${blocos.join(', ')} · ${horario}`);
    });
    return partes.join('; ');
  }

  private faixasDoFormulario(): FaixaAgenda[] {
    return this.agenda.controls
      .map(c => c.value)
      .filter(v => v.atende && v.horaInicio && v.horaFim)
      .map(v => ({ diaSemana: v.diaSemana, horaInicio: v.horaInicio, horaFim: v.horaFim }));
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erroCarregar = false;
    this.funcionarioService.listar().subscribe({
      next: lista => {
        this.funcionarios = lista;
        this.pagina = paginaValida(this.pagina, lista.length);
        this.carregando = false;
      },
      error: ()    => { this.carregando = false; this.erroCarregar = true; }
    });
  }

  get paginados(): Funcionario[] {
    return fatiarPagina(this.funcionarios, this.pagina);
  }

  abrirModal(f?: Funcionario): void {
    this.editando = f;
    this.erro = '';
    this.form.reset({ statusFuncionario: 'ATIVO', funcao: 'RECEPCIONISTA', fotoUrl: null });
    this.montarAgenda(f?.agendaFaixas ?? []);

    if (f?.id) {
      this.funcionarioService.buscarPorId(f.id).subscribe(completo => {
        this.montarAgenda(completo.agendaFaixas ?? []);
      });
    }
    const senhaCtrl = this.form.get('senha')!;
    if (f) {
      this.form.patchValue({
        nome: f.nome,
        funcao: f.funcao,
        statusFuncionario: f.statusFuncionario,
        email: f.email,
        fotoUrl: f.fotoUrl ?? null,
      });
      senhaCtrl.clearValidators();
    } else {
      senhaCtrl.setValidators([Validators.required, Validators.minLength(6)]);
    }
    senhaCtrl.updateValueAndValidity();
    this.modalAberto = true;
  }

  fotoDe(item: { fotoUrl?: string | null }): string {
    return this.arquivoService.urlAbsoluta(item.fotoUrl) || 'assets/funcionario-sem-foto.png';
  }

  aoTrocarFoto(url: string | null): void {
    this.form.get('fotoUrl')?.setValue(url);
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.editando = undefined;
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = '';

    const v = this.form.value;
    const dados: Funcionario = {
      nome: v.nome,
      email: v.email,
      senha: v.senha || undefined,
      funcao: v.funcao,
      statusFuncionario: v.statusFuncionario,
      fotoUrl: v.fotoUrl ?? null,
      agendaFaixas: this.faixasDoFormulario(),
    };

    const req$ = this.editando
      ? this.funcionarioService.atualizar(this.editando.id!, dados, contextoSemToast())
      : this.funcionarioService.criar(dados, contextoSemToast());

    req$.subscribe({
      next: () => { this.fecharModal(); this.carregar(); this.salvando = false; },
      error: (err) => { this.erro = mensagemDeErro(err); this.salvando = false; }
    });
  }

  excluir(id: number): void {
    const funcionario = this.funcionarios.find(f => f.id === id);
    this.confirmService.abrir({
      titulo: 'Excluir funcionário',
      mensagem: `Deseja excluir ${funcionario?.nome ?? 'este funcionário'}? Esta ação não pode ser desfeita.`
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.funcionarioService.excluir(id).subscribe(() => {
        this.funcionarios = this.funcionarios.filter(f => f.id !== id);
        this.pagina = paginaValida(this.pagina, this.funcionarios.length);
      });
    });
  }
}
