import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaixaService, FuncionarioService, ConsultaService, EstoqueService } from '../../core/services/services';
import { TransacaoCaixa, Funcionario, Consulta, Produto, RelatorioCaixa } from '../../core/models';
import { ITENS_POR_PAGINA } from '../../shared/utils/paginacao.utils';
import { contextoSemToast } from '../../core/http/toast.context';
import { mensagemDeErro } from '../../shared/utils/erro.utils';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { agoraLocal } from '../../shared/utils/data.utils';
import { baixarRelatorioPdf, nomeArquivoRelatorio, VERDE, VERMELHO } from '../../shared/utils/relatorio-pdf.utils';

type Recorte = 'MES' | 'SEMANA' | 'DIA';

@Component({
  selector: 'app-caixa',
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.scss']
})
export class CaixaComponent implements OnInit {
  transacoes: TransacaoCaixa[] = [];
  funcionarios: Funcionario[] = [];
  consultas: Consulta[] = [];
  produtos: Produto[] = [];

  totalEntradas = 0;
  totalSaidas = 0;

  mesReferencia = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  recorte: Recorte = 'MES';
  recortes: { valor: Recorte; rotulo: string }[] = [
    { valor: 'MES', rotulo: 'Mês inteiro' },
    { valor: 'SEMANA', rotulo: 'Por semana' },
    { valor: 'DIA', rotulo: 'Por dia' },
  ];
  semanaEscolhida = 0;
  diaEscolhido = '';

  pagina = 1;
  totalItens = 0;
  readonly tamanhoPagina = ITENS_POR_PAGINA;

  relatorio?: RelatorioCaixa;
  modalRelatorioAberto = false;

  private readonly NOMES_MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  private METODO_LABELS: Record<string, string> = {
    PIX: 'Pix',
    DINHEIRO: 'Dinheiro',
    CARTAO_CREDITO: 'Cartão de Crédito',
    CARTAO_DEBITO: 'Cartão de Débito',
  };

  carregando = true;
  erroCarregar = false;
  modalAberto = false;
  salvando = false;
  erro = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private caixaService: CaixaService,
    private funcionarioService: FuncionarioService,
    private consultaService: ConsultaService,
    private estoqueService: EstoqueService,
    private confirmService: ConfirmService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      dataHora:        ['', Validators.required],
      tipo:            ['ENTRADA', Validators.required],
      metodoPagamento: ['PIX', Validators.required],
      funcionarioId:   ['', Validators.required],
      consultaId:      [''],
      valor:           [null, Validators.min(0)],
      itens:           this.fb.array([]),
    });
  }

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  ngOnInit(): void {
    this.carregar();
    this.funcionarioService.listar().subscribe(f => this.funcionarios = f);
    this.estoqueService.listar().subscribe(p => this.produtos = p);

    const vinculada = this.route.snapshot.queryParamMap.get('consultaId');
    this.consultaService.listar().subscribe(c => {
      this.consultas = c;
      if (vinculada) {
        this.abrirModal();
        this.form.patchValue({ consultaId: vinculada, tipo: 'ENTRADA' });
      }
    });
  }

  get nomeMes(): string {
    return `${this.NOMES_MESES[this.mesReferencia.getMonth()]} ${this.mesReferencia.getFullYear()}`;
  }

  private iso(d: Date): string {
    return d.toLocaleDateString('en-CA');
  }

  private ultimoDiaDoMes(): Date {
    return new Date(this.mesReferencia.getFullYear(), this.mesReferencia.getMonth() + 1, 0);
  }

  get semanas(): { rotulo: string; inicio: Date; fim: Date }[] {
    const ultimo = this.ultimoDiaDoMes().getDate();
    const blocos: { rotulo: string; inicio: Date; fim: Date }[] = [];
    for (let dia = 1; dia <= ultimo; dia += 7) {
      const fimDia = Math.min(dia + 6, ultimo);
      blocos.push({
        rotulo: `${String(dia).padStart(2, '0')} a ${String(fimDia).padStart(2, '0')}`,
        inicio: new Date(this.mesReferencia.getFullYear(), this.mesReferencia.getMonth(), dia),
        fim: new Date(this.mesReferencia.getFullYear(), this.mesReferencia.getMonth(), fimDia),
      });
    }
    return blocos;
  }

  get intervalo(): { inicio: string; fim: string } {
    if (this.recorte === 'DIA' && this.diaEscolhido) {
      return { inicio: this.diaEscolhido, fim: this.diaEscolhido };
    }
    if (this.recorte === 'SEMANA') {
      const semana = this.semanas[this.semanaEscolhida] ?? this.semanas[0];
      return { inicio: this.iso(semana.inicio), fim: this.iso(semana.fim) };
    }
    return { inicio: this.iso(this.mesReferencia), fim: this.iso(this.ultimoDiaDoMes()) };
  }

  get rotuloIntervalo(): string {
    const { inicio, fim } = this.intervalo;
    const br = (d: string) => d.split('-').reverse().join('/');
    return inicio === fim ? br(inicio) : `${br(inicio)} a ${br(fim)}`;
  }

  mesAnterior(): void {
    this.mesReferencia = new Date(this.mesReferencia.getFullYear(), this.mesReferencia.getMonth() - 1, 1);
    this.aoMudarPeriodo();
  }

  proximoMes(): void {
    this.mesReferencia = new Date(this.mesReferencia.getFullYear(), this.mesReferencia.getMonth() + 1, 1);
    this.aoMudarPeriodo();
  }

  mesAtual(): void {
    const hoje = new Date();
    this.mesReferencia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    this.aoMudarPeriodo();
  }

  mudarRecorte(recorte: Recorte): void {
    this.recorte = recorte;
    this.semanaEscolhida = 0;
    if (recorte === 'DIA' && !this.diaEscolhido) {
      // No mês corrente começa em hoje; em outro mês, no primeiro dia dele.
      const hoje = new Date();
      const mesCorrente = hoje.getFullYear() === this.mesReferencia.getFullYear()
        && hoje.getMonth() === this.mesReferencia.getMonth();
      this.diaEscolhido = this.iso(mesCorrente ? hoje : this.mesReferencia);
    }
    this.aoMudarPeriodo();
  }

  get diaFormatado(): string {
    if (!this.diaEscolhido) return '';
    const [a, m, d] = this.diaEscolhido.split('-').map(Number);
    return new Date(a, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  }

  get ehHoje(): boolean {
    return this.diaEscolhido === this.iso(new Date());
  }

  diaAnterior(): void { this.moverDia(-1); }
  proximoDia(): void { this.moverDia(1); }

  irParaHoje(): void {
    this.escolherDia(this.iso(new Date()));
  }

  escolherDia(iso: string): void {
    if (!iso) return;
    this.diaEscolhido = iso;
    const [a, m] = iso.split('-').map(Number);
    this.mesReferencia = new Date(a, m - 1, 1);
    this.aoMudarPeriodo();
  }

  private moverDia(delta: number): void {
    const [a, m, d] = (this.diaEscolhido || this.iso(new Date())).split('-').map(Number);
    this.escolherDia(this.iso(new Date(a, m - 1, d + delta)));
  }

  escolherSemana(indice: number): void {
    this.semanaEscolhida = indice;
    this.aoMudarPeriodo();
  }

  aoMudarPeriodo(): void {
    this.pagina = 1;
    this.carregar();
  }

  irParaPagina(pagina: number): void {
    this.pagina = pagina;
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erroCarregar = false;
    const { inicio, fim } = this.intervalo;

    this.caixaService.porPeriodo(inicio, fim, this.pagina, this.tamanhoPagina).subscribe({
      next: p => {
        this.transacoes = p.conteudo;
        this.totalItens = p.totalItens;
        if (p.totalPaginas > 0 && this.pagina > p.totalPaginas) { this.pagina = p.totalPaginas; this.carregar(); return; }
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.erroCarregar = true; }
    });

    this.caixaService.relatorio(inicio, fim).subscribe(r => {
      this.relatorio = r;
      this.totalEntradas = r.totalEntradas;
      this.totalSaidas = r.totalSaidas;
    });
  }

  abrirRelatorio(): void { this.modalRelatorioAberto = true; }
  fecharRelatorio(): void { this.modalRelatorioAberto = false; }

  get itensVendidos() {
    return (this.relatorio?.itens ?? []).filter(i => i.tipo === 'ENTRADA');
  }

  get itensComprados() {
    return (this.relatorio?.itens ?? []).filter(i => i.tipo === 'SAIDA');
  }

  gerandoPdf = false;

  async baixarRelatorioPdf(): Promise<void> {
    const r = this.relatorio;
    if (!r || this.gerandoPdf) return;
    if (r.quantidadeEntradas + r.quantidadeSaidas === 0) {
      this.toast.aviso('Nenhum dado encontrado para os filtros informados.');
      return;
    }

    const colunasItens = [
      { titulo: 'Item', largura: 0.6 },
      { titulo: 'Qtd.', largura: 0.15, alinhar: 'right' as const },
      { titulo: 'Valor', largura: 0.25, alinhar: 'right' as const },
    ];
    const linhasItens = (itens: typeof r.itens) =>
      itens.map(i => [i.produtoNome, String(i.quantidade), this.formatarValor(i.valorTotal)]);

    this.gerandoPdf = true;
    try {
      await baixarRelatorioPdf({
        titulo: 'Relatório do Caixa',
        periodo: this.rotuloIntervalo,
        resumo: [
          {
            rotulo: 'Vendas (entradas)', valor: this.formatarValor(r.totalEntradas),
            detalhe: `${r.quantidadeEntradas} lançamento(s)`, cor: VERDE,
          },
          {
            rotulo: 'Compras (saídas)', valor: this.formatarValor(r.totalSaidas),
            detalhe: `${r.quantidadeSaidas} lançamento(s)`, cor: VERMELHO,
          },
          {
            rotulo: 'Saldo', valor: this.formatarValor(r.saldo),
            cor: r.saldo < 0 ? VERMELHO : undefined,
          },
        ],
        tabelas: [
          {
            titulo: 'Itens vendidos', colunas: colunasItens,
            linhas: linhasItens(this.itensVendidos), vazio: 'Nenhum item vendido no período.',
          },
          {
            titulo: 'Itens comprados', colunas: colunasItens,
            linhas: linhasItens(this.itensComprados), vazio: 'Nenhum item comprado no período.',
          },
        ],
        nota: 'O valor por item usa o preço atual do produto, pois a transação não guarda o preço '
          + 'praticado na época. Os totais acima vêm do valor gravado em cada lançamento.',
        nomeArquivo: nomeArquivoRelatorio('caixa', r.inicio, r.fim),
      });
    } catch {
      this.toast.erro('Não foi possível gerar o PDF do relatório.');
    } finally {
      this.gerandoPdf = false;
    }
  }

  abrirModal(): void {
    this.erro = '';
    if (!this.funcionarios.length) {
      this.funcionarioService.listar().subscribe(f => this.funcionarios = f);
    }
    if (!this.consultas.length) {
      this.consultaService.listar().subscribe(c => this.consultas = c);
    }
    const agora = agoraLocal();
    this.form.reset({ tipo: 'ENTRADA', metodoPagamento: 'PIX', valor: null, dataHora: agora });
    this.itens.clear();
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  adicionarItem(): void {
    this.itens.push(this.fb.group({
      produtoId: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
    }));
  }

  removerItem(i: number): void {
    this.itens.removeAt(i);
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = '';

    const v = this.form.value;
    const dados: TransacaoCaixa = {
      dataHora: v.dataHora.length === 16 ? `${v.dataHora}:00` : v.dataHora,
      tipo: v.tipo,
      metodoPagamento: v.metodoPagamento,
      funcionarioId: v.funcionarioId,
      consultaId: v.consultaId || null,
      valor: v.valor || 0,
      itens: v.itens,
    };

    this.caixaService.criar(dados, contextoSemToast()).subscribe({
      next: () => {
        this.fecharModal();
        this.salvando = false;
        this.mostrarPeriodoDe(dados.dataHora.substring(0, 10));
      },
      error: (err) => { this.erro = mensagemDeErro(err); this.salvando = false; }
    });
  }

  // Depois de lançar, a lista vai para o período da transação, para ela não "sumir"
  // quando a data escolhida no formulário estiver fora do filtro atual.
  private mostrarPeriodoDe(dia: string): void {
    const { inicio, fim } = this.intervalo;
    if (dia >= inicio && dia <= fim) {
      this.carregar();
      return;
    }
    if (this.recorte === 'DIA') {
      this.escolherDia(dia);
      return;
    }
    const [a, m] = dia.split('-').map(Number);
    this.mesReferencia = new Date(a, m - 1, 1);
    this.recorte = 'MES';
    this.aoMudarPeriodo();
  }

  excluir(id: number): void {
    this.confirmService.abrir({
      titulo: 'Excluir transação',
      mensagem: 'Deseja excluir esta transação? O valor deixa de contar nos totais do caixa.'
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.caixaService.excluir(id).subscribe(() => this.carregar());
    });
  }

  detalhe?: TransacaoCaixa;

  abrirDetalhe(t: TransacaoCaixa): void { this.detalhe = t; }
  fecharDetalhe(): void { this.detalhe = undefined; }

  descricao(t: TransacaoCaixa): string {
    if (t.consultaDescricao) return `Consulta: ${t.consultaDescricao.split(' · ').slice(0, 2).join(' · ')}`;
    return t.tipo === 'SAIDA' ? 'Compra de estoque' : 'Venda avulsa';
  }

  resumoItens(t: TransacaoCaixa): string {
    const itens = t.itens ?? [];
    if (!itens.length) return 'Sem itens lançados';
    const nomes = itens.map(i => i.quantidade > 1 ? `${i.produtoNome} ×${i.quantidade}` : i.produtoNome);
    return nomes.length > 2 ? `${nomes.slice(0, 2).join(', ')} e mais ${nomes.length - 2}` : nomes.join(', ');
  }

  subtotalItem(i: { quantidade: number; preco?: number }): number {
    return (i.preco ?? 0) * i.quantidade;
  }

  // Parte do total que não veio de itens (ex.: taxa digitada no campo "Valor de serviço").
  outrosValores(t: TransacaoCaixa): number {
    const itens = (t.itens ?? []).reduce((soma, i) => soma + this.subtotalItem(i), 0);
    const diferenca = (t.valorTotal ?? 0) - itens;
    return Math.abs(diferenca) < 0.005 ? 0 : diferenca;
  }

  formatarValor(v?: number): string {
    return (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  dataFormatada(t: TransacaoCaixa): string {
    return t.dataHora?.substring(0, 10).split('-').reverse().join('/') ?? '';
  }

  horario(t: TransacaoCaixa): string {
    return t.dataHora?.substring(11, 16) ?? '';
  }

  metodoLabel(m: string): string {
    return this.METODO_LABELS[m] ?? m;
  }
}
