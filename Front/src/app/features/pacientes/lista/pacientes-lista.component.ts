import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PacienteService } from '../../../core/services/paciente.service';
import { TutorService } from '../../../core/services/paciente.service';
import { Paciente, Tutor } from '../../../core/models';
import { pesoParaTexto } from '../../../shared/utils/mask.utils';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ArquivoService } from '../../../core/services/arquivo.service';
import { fatiarPagina, paginaValida } from '../../../shared/utils/paginacao.utils';
import { PacienteFormModalComponent } from '../../../shared/components/paciente-form-modal/paciente-form-modal.component';

@Component({
  selector: 'app-pacientes-lista',
  templateUrl: './pacientes-lista.component.html',
  styleUrls: ['./pacientes-lista.component.scss']
})
export class PacientesListaComponent implements OnInit {
  pacientes: Paciente[] = [];
  filtrados: Paciente[] = [];
  tutores: Tutor[] = [];
  busca = '';
  pagina = 1;
  carregando = true;
  erroCarregar = false;
  modalAberto = false;
  editando?: Paciente;

  @ViewChild(PacienteFormModalComponent) formPaciente?: PacienteFormModalComponent;
  modalTutorAberto = false;

  constructor(
    private pacienteService: PacienteService,
    private tutorService: TutorService,
    private router: Router,
    private confirmService: ConfirmService,
    private arquivoService: ArquivoService
  ) {}

  foto(p: Paciente): string {
    return this.arquivoService.urlAbsoluta(p.fotoUrl) || 'assets/animal-sem-foto.png';
  }

  ngOnInit(): void {
    this.carregarPacientes();
    this.carregarTutores();
  }

  carregarTutores(): void {
    this.tutorService.listar().subscribe({
      next: lista => {
        this.tutores = lista;
      },
      error: () => { }
    });
  }

  carregarPacientes(): void {
    this.carregando = true;
    this.erroCarregar = false;
    this.pacienteService.listar().subscribe({
      next: lista => {
        this.pacientes = lista;
        this.filtrar(false);
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.erroCarregar = true; }
    });
  }

  filtrar(voltarAoInicio = true): void {
    const q = this.busca.toLowerCase();
    this.filtrados = this.pacientes.filter(p =>
      p.nome.toLowerCase().includes(q) || p.tutorNome?.toLowerCase().includes(q)
    );
    this.pagina = voltarAoInicio ? 1 : paginaValida(this.pagina, this.filtrados.length);
  }

  get paginados(): Paciente[] {
    return fatiarPagina(this.filtrados, this.pagina);
  }

  abrirModal(p?: Paciente, event?: Event): void {
    event?.stopPropagation();
    this.editando = p;
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.editando = undefined;
  }

  aoSalvarPaciente(): void {
    this.fecharModal();
    this.carregarPacientes();
  }

  pesoFormatado(valor?: number | null): string {
    return pesoParaTexto(valor);
  }

  verPerfil(id: number): void {
    this.router.navigate(['/pacientes', id]);
  }

  excluir(id: number, event: Event): void {
    event.stopPropagation();
    const paciente = this.pacientes.find(p => p.id === id);
    this.confirmService.abrir({
      titulo: 'Excluir paciente',
      mensagem: `Deseja excluir ${paciente?.nome ?? 'este paciente'}? Esta ação não pode ser desfeita.`
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.pacienteService.excluir(id).subscribe(() => {
        this.pacientes = this.pacientes.filter(p => p.id !== id);
        this.filtrar(false);
      });
    });
  }

  abrirModalTutor(): void {
    this.modalTutorAberto = true;
  }

  fecharModalTutor(): void {
    this.modalTutorAberto = false;
  }

  aoSalvarTutor(novoTutor: Tutor): void {
    this.fecharModalTutor();
    this.carregarTutores();
    if (novoTutor?.id) this.formPaciente?.selecionarTutor(novoTutor.id);
  }
}
