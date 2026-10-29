export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  fotoUrl?: string | null;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  id?: number;
  nome: string;
  email: string;
  funcao?: string;
}

export type UnidadeIdade = 'DIAS' | 'MESES' | 'ANOS';

export interface Paciente {
  id?: number;
  nome: string;
  raca: string;
  idade: number;
  unidadeIdade?: UnidadeIdade;
  peso: number;
  alergias?: string;
  informacoes?: string;
  tutorId: number;
  tutorNome?: string;
  fotoUrl?: string | null;
}

export interface Tutor {
  id?: number;
  nome: string;
  cpf: string;
  telefone: string;
  endereco?: string;
}

export interface HistoricoMedico {
  id?: number;
  data: string;
  motivo: string;
  veterinario: string;
  descricao: string;
  pacienteId: number;
}

export type StatusConsulta = 'AGENDADA' | 'EM_ANDAMENTO' | 'CANCELADA' | 'FINALIZADA';

export interface ReceituarioResumo {
  id: number;
  dataEmissao: string;
  prescricao: string;
}

export interface Consulta {
  id?: number;
  dataHora: string;
  motivo: string;
  status?: StatusConsulta;
  funcionarioId: number;
  funcionario?: string;
  pacienteId: number;
  paciente?: string;
  receituario?: ReceituarioResumo | null;
}

export type FuncaoFuncionario = 'GERENTE' | 'VETERINARIO' | 'RECEPCIONISTA' | 'AUXILIAR';
export type StatusFuncionario = 'ATIVO' | 'DESATIVADO';

export type DiaSemana =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface FaixaAgenda {
  id?: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
}

export interface Funcionario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  funcao: FuncaoFuncionario;
  agenda?: string;
  statusFuncionario: StatusFuncionario;
  fotoUrl?: string | null;
  agendaFaixas?: FaixaAgenda[];
}

export type TipoProduto = 'MEDICAMENTO' | 'ALIMENTO' | 'ACESSORIO' | 'OUTRO';

export type NaturezaItem = 'PRODUTO' | 'SERVICO';

export type TipoServico = 'CONSULTA' | 'CIRURGIA' | 'VACINACAO' | 'BANHO_TOSA' | 'EXAME' | 'OUTRO';

export interface Produto {
  id?: number;
  nome: string;
  descricao?: string;
  preco: number;
  quantidade: number | null;
  tipoProduto: TipoProduto;
  naturezaItem: NaturezaItem;
  tipoServico?: TipoServico | null;
  fotoUrl?: string | null;
}

export type StatusAdocao = 'DISPONIVEL' | 'EM_TRATAMENTO' | 'ADOTADO';

export interface AnimalAdocao {
  id?: number;
  nome: string;
  raca: string;
  idade: number;
  unidadeIdade?: UnidadeIdade;
  peso?: number;
  alergias?: string;
  informacoes?: string;
  statusAdocao: StatusAdocao;  fotoUrl?: string | null;
}

export interface Receituario {
  id?: number;
  dataEmissao: string;
  prescricao: string;
  consultaId: number;
  consulta?: string;
}

export type TipoTransacao = 'ENTRADA' | 'SAIDA';

export interface ItemTransacao {
  id?: number;
  produtoId: number;
  produtoNome?: string;
  quantidade: number;
  preco?: number;
}

export interface ItemTransacaoInput {
  produtoId: number;
  quantidade: number;
}

export interface TransacaoCaixa {
  id?: number;
  dataHora: string;
  valorTotal?: number;
  valor?: number;
  metodoPagamento: string;
  tipo: TipoTransacao;
  funcionarioId: number;
  funcionarioNome?: string | null;
  consultaId?: number | null;
  consultaDescricao?: string | null;
  itens?: ItemTransacao[];
}

export type TipoNotificacao =
  | 'PACIENTE_CADASTRADO'
  | 'CONSULTA_AGENDADA'
  | 'ESTOQUE_BAIXO'
  | 'CONSULTA_PROXIMA';

export interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  criadaEm: string;
  lida: boolean;
}

export interface PaginaDe<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
}

export interface ItemResumo {
  produtoNome: string;
  tipo: TipoTransacao;
  quantidade: number;
  valorTotal: number;
}

export interface RelatorioCaixa {
  inicio: string;
  fim: string;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  quantidadeEntradas: number;
  quantidadeSaidas: number;
  itens: ItemResumo[];
}

export interface RelatorioAgenda {
  inicio: string;
  fim: string;
  total: number;
  porStatus: Record<string, number>;
  porVeterinario: Record<string, number>;
  consultas: Consulta[];
}
