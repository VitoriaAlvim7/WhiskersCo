import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { mensagemDeErro } from '../../../shared/utils/erro.utils';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent {
  form: FormGroup;
  loading = false;
  erro = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nome:  ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  cadastrar(): void {
    this.erro = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.get('senha')?.hasError('minlength')) {
        this.erro = 'A senha precisa ter no mínimo 6 caracteres.';
      } else if (this.form.get('email')?.hasError('email')) {
        this.erro = 'Digite um e-mail válido.';
      } else {
        this.erro = 'Preencha todos os campos.';
      }
      return;
    }

    this.loading = true;

    this.auth.cadastro(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.erro = mensagemDeErro(err);
        this.loading = false;
      }
    });
  }
}
