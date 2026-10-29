import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EstoqueService } from '../../core/services/services';
import { NaturezaItem, Produto, TipoServico } from '../../core/models';
import { contextoSemToast } from '../../core/http/toast.context';
import { mensagemDeErro } from '../../shared/utils/erro.utils';
import { ConfirmService } from '../../core/services/confirm.service';
import { fatiarPagina, paginaValida } from '../../shared/utils/paginacao.utils';
import { ArquivoService } from '../../core/services/arquivo.service';

type FiltroTipo = 'TODOS' | string;

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.component.html',
  styleUrls: ['./estoque.component.scss']
})
export class EstoqueComponent implements OnInit {
  produtos: Produto[] = [];
  busca = '';
  pagina = 1;
  carregando = true;
  erroCarregar = false;
  modalAberto = false;
  editando?: Produto;
  salvando = false;
  erro = '';

  form: FormGroup;

  naturezaAtiva: NaturezaItem = 'PRODUTO';
  naturezas: { valor: NaturezaItem; rotulo: string }[] = [
    { valor: 'PRODUTO', rotulo: 'Produtos' },
    { valor: 'SERVICO', rotulo: 'Serviços' },
  ];

  filtroTipo: FiltroTipo = 'TODOS';

  tiposPorNatureza: Record<NaturezaItem, { valor: FiltroTipo; rotulo: string }[]> = {
    PRODUTO: [
      { valor: 'TODOS', rotulo: 'Todos' },
      { valor: 'MEDICAMENTO', rotulo: 'Medicamento' },
      { valor: 'ALIMENTO', rotulo: 'Alimento' },
      { valor: 'ACESSORIO', rotulo: 'Acessório' },
      { valor: 'OUTRO', rotulo: 'Outro' },
    ],
    SERVICO: [
      { valor: 'TODOS', rotulo: 'Todos' },
      { valor: 'CONSULTA', rotulo: 'Consulta' },
      { valor: 'CIRURGIA', rotulo: 'Cirurgia' },
      { valor: 'VACINACAO', rotulo: 'Vacinação' },
      { valor: 'BANHO_TOSA', rotulo: 'Banho e tosa' },
      { valor: 'EXAME', rotulo: 'Exame' },
      { valor: 'OUTRO', rotulo: 'Outro' },
    ],
  };

  private TIPO_PRODUTO_LABELS: Record<string, string> = {
    MEDICAMENTO: 'Medicamento',
    ALIMENTO: 'Alimento',
    ACESSORIO: 'Acessório',
    OUTRO: 'Outro',
  };

  private TIPO_SERVICO_LABELS: Record<string, string> = {
    CONSULTA: 'Consulta',
    CIRURGIA: 'Cirurgia',
    VACINACAO: 'Vacinação',
    BANHO_TOSA: 'Banho e tosa',
    EXAME: 'Exame',
    OUTRO: 'Outro',
  };

  get tiposDaNaturezaAtiva(): { valor: FiltroTipo; rotulo: string }[] {
    return this.tiposPorNatureza[this.naturezaAtiva];
  }

  tipoLabel(p: Produto): string {
    return p.naturezaItem === 'SERVICO'
      ? this.TIPO_SERVICO_LABELS[p.tipoServico ?? ''] ?? p.tipoServico ?? ''
      : this.TIPO_PRODUTO_LABELS[p.tipoProduto] ?? p.tipoProduto;
  }

  constructor(
    private fb: FormBuilder,
    private estoqueService: EstoqueService,
    private confirmService: ConfirmService,
    private arquivoService: ArquivoService
  ) {
    this.form = this.fb.group({
      nome:         ['', Validators.required],
      quantidade:   [null, [Validators.required, Validators.min(0)]],
      preco:        [null, [Validators.required, Validators.min(0)]],
      descricao:    [''],
      tipoProduto:  ['OUTRO', Validators.required],
      naturezaItem: ['PRODUTO' as NaturezaItem, Validators.required],
      tipoServico:  [null as TipoServico | null],
      fotoUrl:      [null as string | null],
    });
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erroCarregar = false;
    this.estoqueService.listar().subscribe({
      next: lista => {
        this.produtos = lista;
        this.pagina = paginaValida(this.pagina, this.filtrados.length);
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.erroCarregar = true; }
    });
  }

  mudarNatureza(natureza: NaturezaItem): void {
    if (this.naturezaAtiva === natureza) return;
    this.naturezaAtiva = natureza;
    this.filtroTipo = 'TODOS';
    this.pagina = 1;
  }

  mudarTipo(tipo: FiltroTipo): void {
    this.filtroTipo = tipo;
    this.pagina = 1;
  }

  filtrar(): void {
    this.pagina = 1;
  }

  get itensDaNatureza(): Produto[] {
    return this.produtos.filter(p => p.naturezaItem === this.naturezaAtiva);
  }

  get filtrados(): Produto[] {
    const q = this.busca.toLowerCase();
    const porBusca = q ? this.itensDaNatureza.filter(p => p.nome.toLowerCase().includes(q)) : this.itensDaNatureza;
    if (this.filtroTipo === 'TODOS') return porBusca;
    return porBusca.filter(p =>
      (this.naturezaAtiva === 'SERVICO' ? p.tipoServico : p.tipoProduto) === this.filtroTipo
    );
  }

  get paginados(): Produto[] {
    return fatiarPagina(this.filtrados, this.pagina);
  }

  contarNatureza(natureza: NaturezaItem): number {
    return this.produtos.filter(p => p.naturezaItem === natureza).length;
  }

  contarTipo(tipo: FiltroTipo): number {
    if (tipo === 'TODOS') return this.itensDaNatureza.length;
    return this.itensDaNatureza.filter(p =>
      (this.naturezaAtiva === 'SERVICO' ? p.tipoServico : p.tipoProduto) === tipo
    ).length;
  }

  get ehServico(): boolean {
    return this.form.get('naturezaItem')?.value === 'SERVICO';
  }

  aoTrocarNatureza(): void {
    const quantidade = this.form.get('quantidade')!;
    const tipoProduto = this.form.get('tipoProduto')!;
    const tipoServico = this.form.get('tipoServico')!;

    if (this.ehServico) {
      quantidade.clearValidators();
      quantidade.setValue(null);
      tipoProduto.clearValidators();
      tipoProduto.setValue(null);
      tipoServico.setValidators(Validators.required);
      if (!tipoServico.value) tipoServico.setValue('OUTRO');
    } else {
      quantidade.setValidators([Validators.required, Validators.min(0)]);
      if (quantidade.value === null) quantidade.setValue(0);
      tipoProduto.setValidators(Validators.required);
      if (!tipoProduto.value) tipoProduto.setValue('OUTRO');
      tipoServico.clearValidators();
      tipoServico.setValue(null);
    }
    quantidade.updateValueAndValidity();
    tipoProduto.updateValueAndValidity();
    tipoServico.updateValueAndValidity();
  }

  abrirModal(p?: Produto): void {
    this.editando = p;
    this.erro = '';
    this.form.reset({
      quantidade: null,
      preco: null,
      tipoProduto: 'OUTRO',
      naturezaItem: p?.naturezaItem ?? this.naturezaAtiva,
      tipoServico: null,
      fotoUrl: null,
    });
    if (p) this.form.patchValue(p);
    this.aoTrocarNatureza();
    this.modalAberto = true;
  }

  fotoDe(item: { fotoUrl?: string | null }): string {
    return this.arquivoService.urlAbsoluta(item.fotoUrl) || 'assets/produto-sem-foto.png';
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

    const dados: Produto = this.form.value;
    const req$ = this.editando
      ? this.estoqueService.atualizar(this.editando.id!, dados, contextoSemToast())
      : this.estoqueService.criar(dados, contextoSemToast());

    req$.subscribe({
      next: () => { this.fecharModal(); this.carregar(); this.salvando = false; },
      error: (err) => { this.erro = mensagemDeErro(err); this.salvando = false; }
    });
  }

  excluir(p: Produto): void {
    const rotulo = p.naturezaItem === 'SERVICO' ? 'serviço' : 'produto';
    this.confirmService.abrir({
      titulo: `Excluir ${rotulo}`,
      mensagem: `Deseja excluir ${p.nome}? Esta ação não pode ser desfeita.`
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.estoqueService.excluir(p.id!).subscribe(() => {
        this.produtos = this.produtos.filter(x => x.id !== p.id);
        this.pagina = paginaValida(this.pagina, this.filtrados.length);
      });
    });
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
