import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Paciente, Tutor } from '../../../core/models';
import { PacienteService } from '../../../core/services/paciente.service';
import { contextoSemToast } from '../../../core/http/toast.context';
import { mensagemDeErro } from '../../utils/erro.utils';
import { maskPeso, PESO_PADRAO, pesoParaNumero, pesoParaTexto } from '../../utils/mask.utils';

@Component({
  selector: 'app-paciente-form-modal',
  templateUrl: './paciente-form-modal.component.html',
  styleUrls: ['./paciente-form-modal.component.scss']
})
export class PacienteFormModalComponent implements OnChanges {
  @Input() aberto = false;
  @Input() paciente?: Paciente;
  @Input() tutores: Tutor[] = [];
  @Input() permiteNovoTutor = false;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<Paciente>();
  @Output() novoTutor = new EventEmitter<void>();

  form: FormGroup;
  salvando = false;
  erro = '';

  constructor(private fb: FormBuilder, private pacienteService: PacienteService) {
    this.form = this.fb.group({
      nome:        ['', Validators.required],
      raca:        ['', Validators.required],
      idade:       ['', [Validators.required, Validators.min(0)]],
      peso:        ['', [Validators.required, Validators.pattern(PESO_PADRAO)]],
      alergias:    [''],
      informacoes: [''],
      tutorId:     ['', Validators.required],
      fotoUrl:     [null as string | null],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aberto'] && this.aberto) this.prepararFormulario();
  }

  get editando(): boolean {
    return !!this.paciente?.id;
  }

  private prepararFormulario(): void {
    this.erro = '';
    this.salvando = false;
    this.form.reset();
    if (this.paciente) {
      this.form.patchValue({
        nome:        this.paciente.nome,
        raca:        this.paciente.raca,
        idade:       this.paciente.idade,
        peso:        pesoParaTexto(this.paciente.peso),
        alergias:    this.paciente.alergias ?? '',
        informacoes: this.paciente.informacoes ?? '',
        tutorId:     this.paciente.tutorId ?? '',
        fotoUrl:     this.paciente.fotoUrl ?? null,
      });
    }
  }

  selecionarTutor(tutorId: number): void {
    this.form.patchValue({ tutorId });
  }

  aoDigitarPeso(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.get('peso')?.setValue(maskPeso(input.value), { emitEvent: false });
  }

  aoTrocarFoto(url: string | null): void {
    this.form.get('fotoUrl')?.setValue(url);
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = '';

    const dados: Paciente = {
      ...this.form.value,
      peso: pesoParaNumero(this.form.value.peso),
      unidadeIdade: 'ANOS',
    };
    const req$ = this.editando
      ? this.pacienteService.atualizar(this.paciente!.id!, dados, contextoSemToast())
      : this.pacienteService.criar(dados, contextoSemToast());

    req$.subscribe({
      next: p => { this.salvando = false; this.salvo.emit(p); },
      error: err => { this.erro = mensagemDeErro(err); this.salvando = false; }
    });
  }
}
