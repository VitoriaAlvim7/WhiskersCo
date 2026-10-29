import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdocaoService } from '../../core/services/services';
import { TutorService } from '../../core/services/paciente.service';
import { AnimalAdocao, StatusAdocao, Tutor } from '../../core/models';
import { contextoSemToast } from '../../core/http/toast.context';
import { mensagemDeErro } from '../../shared/utils/erro.utils';
import { maskPeso, PESO_PADRAO, pesoParaNumero, pesoParaTexto } from '../../shared/utils/mask.utils';
import { ConfirmService } from '../../core/services/confirm.service';
import { fatiarPagina, paginaValida } from '../../shared/utils/paginacao.utils';
import { ArquivoService } from '../../core/services/arquivo.service';

type FiltroStatus = 'TODOS' | StatusAdocao;

@Component({
  selector: 'app-adocao',
  templateUrl: './adocao.component.html',
  styleUrls: ['./adocao.component.scss']
})
export class AdocaoComponent implements OnInit {
  animais: AnimalAdocao[] = [];
  tutores: Tutor[] = [];
  pagina = 1;
  carregando = true;
  erroCarregar = false;
  modalAberto = false;
  editando?: AnimalAdocao;
  salvando = false;
  erro = '';

  modalAdocaoAberto = false;
  animalParaAdotar?: AnimalAdocao;
  tutorEscolhido: number | '' = '';
  adotando = false;
  erroAdocao = '';

  filtroStatus: FiltroStatus = 'TODOS';
  filtros: { valor: FiltroStatus; rotulo: string }[] = [
    { valor: 'TODOS',         rotulo: 'Todos' },
    { valor: 'DISPONIVEL',    rotulo: 'Disponível' },
    { valor: 'EM_TRATAMENTO', rotulo: 'Em tratamento' },
    { valor: 'ADOTADO',       rotulo: 'Adotado' },
  ];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adocaoService: AdocaoService,
    private tutorService: TutorService,
    private confirmService: ConfirmService,
    private arquivoService: ArquivoService
  ) {
    this.form = this.fb.group({
      nome:         ['', Validators.required],
      raca:         ['', Validators.required],
      idade:        [null, Validators.min(0)],
      peso:         ['', Validators.pattern(PESO_PADRAO)],
      alergias:     [''],
      informacoes:  [''],
      statusAdocao: ['DISPONIVEL', Validators.required],
      fotoUrl:      [null as string | null],
    });
  }

  ngOnInit(): void {
    this.carregar();
    this.tutorService.listar().subscribe(t => this.tutores = t);
  }

  carregar(): void {
    this.carregando = true;
    this.erroCarregar = false;
    this.adocaoService.listar().subscribe({
      next: lista => { this.animais = lista; this.carregando = false; },
      error: () => { this.carregando = false; this.erroCarregar = true; }
    });
  }

  get animaisFiltrados(): AnimalAdocao[] {
    return this.filtroStatus === 'TODOS'
      ? this.animais
      : this.animais.filter(a => a.statusAdocao === this.filtroStatus);
  }

  get animaisPaginados(): AnimalAdocao[] {
    return fatiarPagina(this.animaisFiltrados, this.pagina);
  }

  mudarFiltro(filtro: FiltroStatus): void {
    this.filtroStatus = filtro;
    this.pagina = 1;
  }

  contar(filtro: FiltroStatus): number {
    return filtro === 'TODOS'
      ? this.animais.length
      : this.animais.filter(a => a.statusAdocao === filtro).length;
  }

  abrirModal(a?: AnimalAdocao): void {
    this.editando = a;
    this.erro = '';
    this.form.reset({ statusAdocao: 'DISPONIVEL', idade: null, peso: '', fotoUrl: null });
    if (a) this.form.patchValue({ ...a, peso: pesoParaTexto(a.peso) });
    this.modalAberto = true;
  }

  fotoDe(item: { fotoUrl?: string | null }): string {
    return this.arquivoService.urlAbsoluta(item.fotoUrl) || 'assets/animal-sem-foto.png';
  }

  aoTrocarFoto(url: string | null): void {
    this.form.get('fotoUrl')?.setValue(url);
  }

  fecharModal(): void { this.modalAberto = false; this.editando = undefined; }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    const dados: AnimalAdocao = {
      ...this.form.value,
      peso: pesoParaNumero(this.form.value.peso),
      unidadeIdade: 'ANOS',
    };
    const req$ = this.editando
      ? this.adocaoService.atualizar(this.editando.id!, dados, contextoSemToast())
      : this.adocaoService.criar(dados, contextoSemToast());

    req$.subscribe({
      next: () => { this.fecharModal(); this.carregar(); this.salvando = false; },
      error: (err) => { this.erro = mensagemDeErro(err); this.salvando = false; }
    });
  }

  aoDigitarPeso(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.get('peso')?.setValue(maskPeso(input.value), { emitEvent: false });
  }

  pesoFormatado(valor?: number | null): string {
    return pesoParaTexto(valor);
  }

  excluir(id: number): void {
    const animal = this.animais.find(a => a.id === id);
    this.confirmService.abrir({
      titulo: 'Remover da adoção',
      mensagem: `Remover ${animal?.nome ?? 'este animal'} da lista de adoção? Esta ação não pode ser desfeita.`
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.adocaoService.excluir(id).subscribe(() => {
        this.animais = this.animais.filter(a => a.id !== id);
        this.pagina = paginaValida(this.pagina, this.animaisFiltrados.length);
      });
    });
  }

  podeAdotar(a: AnimalAdocao): boolean {
    return a.statusAdocao === 'DISPONIVEL';
  }

  motivoNaoAdotavel(a: AnimalAdocao): string {
    if (this.podeAdotar(a)) return '';
    if (a.statusAdocao === 'ADOTADO') return `${a.nome} já foi adotado.`;
    if (a.statusAdocao === 'EM_TRATAMENTO') return `${a.nome} está em tratamento e não pode ser adotado agora.`;
    return `${a.nome} não está disponível para adoção.`;
  }

  abrirModalAdocao(a: AnimalAdocao): void {
    this.animalParaAdotar = a;
    this.tutorEscolhido = '';
    this.erroAdocao = '';
    this.modalAdocaoAberto = true;
  }

  fecharModalAdocao(): void {
    this.modalAdocaoAberto = false;
    this.animalParaAdotar = undefined;
  }

  confirmarAdocao(): void {
    if (!this.animalParaAdotar || !this.tutorEscolhido) return;
    this.adotando = true;
    this.erroAdocao = '';
    this.adocaoService.adotar(this.animalParaAdotar.id!, this.tutorEscolhido as number, contextoSemToast()).subscribe({
      next: () => { this.adotando = false; this.fecharModalAdocao(); this.carregar(); },
      error: err => {
        this.adotando = false;
        this.erroAdocao = mensagemDeErro(err);
        this.carregar();
      }
    });
  }

  statusLabel(s?: string): string {
    return s === 'DISPONIVEL' ? 'Disponível' : s === 'EM_TRATAMENTO' ? 'Em tratamento' : s === 'ADOTADO' ? 'Adotado' : s ?? '';
  }
}
