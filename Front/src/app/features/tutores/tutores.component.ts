import { Component, OnInit } from '@angular/core';
import { TutorService } from '../../core/services/paciente.service';
import { Tutor } from '../../core/models';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { maskCpf, maskTelefone } from '../../shared/utils/mask.utils';
import { fatiarPagina, paginaValida } from '../../shared/utils/paginacao.utils';

type Aba = 'ATIVOS' | 'INATIVOS';

@Component({
  selector: 'app-tutores',
  templateUrl: './tutores.component.html',
  styleUrls: ['./tutores.component.scss']
})
export class TutoresComponent implements OnInit {
  tutores: Tutor[] = [];
  filtrados: Tutor[] = [];
  busca = '';
  pagina = 1;
  carregando = true;
  erroCarregar = false;

  aba: Aba = 'ATIVOS';
  abas: { valor: Aba; rotulo: string }[] = [
    { valor: 'ATIVOS', rotulo: 'Ativos' },
    { valor: 'INATIVOS', rotulo: 'Inativos' },
  ];

  modalAberto = false;
  editando?: Tutor;

  constructor(
    private tutorService: TutorService,
    private confirmService: ConfirmService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erroCarregar = false;
    const req$ = this.aba === 'ATIVOS'
      ? this.tutorService.listar()
      : this.tutorService.listarInativos();

    req$.subscribe({
      next: lista => {
        this.tutores = lista;
        this.filtrar(false);
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.erroCarregar = true; }
    });
  }

  mudarAba(aba: Aba): void {
    if (this.aba === aba) return;
    this.aba = aba;
    this.busca = '';
    this.pagina = 1;
    this.carregar();
  }

  filtrar(voltarAoInicio = true): void {
    const q = this.busca.toLowerCase();
    const soDigitos = q.replace(/\D/g, '');
    this.filtrados = this.tutores.filter(t =>
      t.nome.toLowerCase().includes(q) ||
      (!!soDigitos && (t.cpf ?? '').replace(/\D/g, '').includes(soDigitos)) ||
      (!!soDigitos && (t.telefone ?? '').replace(/\D/g, '').includes(soDigitos))
    );
    this.pagina = voltarAoInicio ? 1 : paginaValida(this.pagina, this.filtrados.length);
  }

  get paginados(): Tutor[] {
    return fatiarPagina(this.filtrados, this.pagina);
  }

  abrirModal(t?: Tutor): void {
    this.editando = t;
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.editando = undefined;
  }

  aoSalvar(): void {
    this.fecharModal();
    this.carregar();
  }

  excluir(t: Tutor): void {
    this.confirmService.abrir({
      titulo: 'Excluir tutor',
      mensagem: `Deseja excluir ${t.nome}?`,
      aviso: 'Os pacientes vinculados continuam cadastrados. O tutor vai para a aba Inativos e pode ser reativado.',
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.tutorService.excluir(t.id!).subscribe(() => {
        this.tutores = this.tutores.filter(x => x.id !== t.id);
        this.filtrar(false);
      });
    });
  }

  reativar(t: Tutor): void {
    this.tutorService.reativar(t.id!).subscribe(() => {
      this.toast.sucesso(`${t.nome} foi reativado.`);
      this.carregar();
    });
  }

  cpfFormatado(cpf?: string): string {
    return maskCpf(cpf ?? '');
  }

  telefoneFormatado(telefone?: string): string {
    return maskTelefone(telefone ?? '');
  }
}
