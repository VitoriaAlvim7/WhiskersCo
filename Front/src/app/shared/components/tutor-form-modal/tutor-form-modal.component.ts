import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tutor } from '../../../core/models';
import { TutorService } from '../../../core/services/paciente.service';
import { contextoSemToast } from '../../../core/http/toast.context';
import { mensagemDeErro } from '../../utils/erro.utils';
import { maskCpf, maskTelefone, CPF_PADRAO, TELEFONE_PADRAO } from '../../utils/mask.utils';

@Component({
  selector: 'app-tutor-form-modal',
  templateUrl: './tutor-form-modal.component.html',
  styleUrls: ['./tutor-form-modal.component.scss']
})
export class TutorFormModalComponent implements OnChanges {
  @Input() aberto = false;
  @Input() tutor?: Tutor;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<Tutor>();

  form: FormGroup;
  salvando = false;
  erro = '';

  constructor(private fb: FormBuilder, private tutorService: TutorService) {
    this.form = this.fb.group({
      nome:     ['', Validators.required],
      cpf:      ['', [Validators.required, Validators.pattern(CPF_PADRAO)]],
      telefone: ['', [Validators.required, Validators.pattern(TELEFONE_PADRAO)]],
      endereco: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aberto'] && this.aberto) this.prepararFormulario();
  }

  get editando(): boolean {
    return !!this.tutor?.id;
  }

  private prepararFormulario(): void {
    this.erro = '';
    this.salvando = false;
    this.form.reset();
    if (this.tutor) {
      this.form.patchValue({
        nome:     this.tutor.nome,
        cpf:      maskCpf(this.tutor.cpf ?? ''),
        telefone: maskTelefone(this.tutor.telefone ?? ''),
        endereco: this.tutor.endereco ?? '',
      });
    }
  }

  aoDigitarCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.get('cpf')?.setValue(maskCpf(input.value), { emitEvent: false });
  }

  aoDigitarTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.get('telefone')?.setValue(maskTelefone(input.value), { emitEvent: false });
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = '';

    const dados: Tutor = this.form.value;
    const req$ = this.editando
      ? this.tutorService.atualizar(this.tutor!.id!, dados, contextoSemToast())
      : this.tutorService.criar(dados, contextoSemToast());

    req$.subscribe({
      next: t => { this.salvando = false; this.salvo.emit(t); },
      error: err => { this.erro = mensagemDeErro(err); this.salvando = false; }
    });
  }
}
