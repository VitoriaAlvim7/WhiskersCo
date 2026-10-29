import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PacienteService } from '../../../core/services/paciente.service';
import { Paciente, HistoricoMedico, Tutor } from '../../../core/models';
import { TutorService } from '../../../core/services/paciente.service';
import { pesoParaTexto } from '../../../shared/utils/mask.utils';
import { ArquivoService } from '../../../core/services/arquivo.service';

@Component({
  selector: 'app-pacientes-perfil',
  templateUrl: './pacientes-perfil.component.html',
  styleUrls: ['./pacientes-perfil.component.scss']
})
export class PacientesPerfilComponent implements OnInit {
  paciente?: Paciente;
  historico: HistoricoMedico[] = [];
  carregando = true;

  tutores: Tutor[] = [];
  modalAberto = false;

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private tutorService: TutorService,
    private arquivoService: ArquivoService
  ) {}

  ngOnInit(): void {
    this.tutorService.listar().subscribe(t => this.tutores = t);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pacienteService.buscarPorId(id).subscribe({
      next: p => {
        this.paciente = p;
        this.pacienteService.historico(id).subscribe({
          next: h => { this.historico = h; this.carregando = false; },
          error: () => { this.carregando = false; }
        });
      },
      error: () => { this.carregando = false; }
    });
  }

  fotoDe(item: { fotoUrl?: string | null }): string {
    return this.arquivoService.urlAbsoluta(item.fotoUrl) || 'assets/animal-sem-foto.png';
  }

  pesoFormatado(valor?: number | null): string {
    return pesoParaTexto(valor);
  }

  abrirEdicao(): void {
    this.modalAberto = true;
  }

  fecharEdicao(): void {
    this.modalAberto = false;
  }

  aoSalvar(p: Paciente): void {
    this.paciente = p;
    this.fecharEdicao();
  }
}
