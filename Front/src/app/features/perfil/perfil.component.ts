import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { FuncionarioService } from '../../core/services/services';
import { Funcionario } from '../../core/models';
import { contextoSemToast } from '../../core/http/toast.context';
import { mensagemDeErro } from '../../shared/utils/erro.utils';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  usuarioId?: number;
  funcionarioAtual?: Funcionario;

  carregando = true;
  semId = false;
  salvandoDados = false;
  salvandoSenha = false;
  erroDados = '';
  sucessoDados = '';
  erroSenha = '';
  sucessoSenha = '';

  formDados: FormGroup;
  formSenha: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private funcionarioService: FuncionarioService
  ) {
    this.formDados = this.fb.group({
      nome:    ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      fotoUrl: [null as string | null],
    });

    this.formSenha = this.fb.group({
      senhaAtual: ['', Validators.required],
      novaSenha:  ['', [Validators.required, Validators.minLength(6)]],
      confirmar:  ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.auth.sincronizarUsuario().subscribe({
      next: atual => this.carregarFuncionario(atual.id),
      error: () => this.carregarFuncionario(this.auth.getUsuario()?.id),
    });
  }

  private carregarFuncionario(id?: number): void {
    this.usuarioId = id;

    if (!this.usuarioId) {
      this.semId = true;
      this.carregando = false;
      return;
    }

    this.funcionarioService.buscarPorId(this.usuarioId).subscribe({
      next: f => {
        this.funcionarioAtual = f;
        this.formDados.patchValue({ nome: f.nome, email: f.email, fotoUrl: f.fotoUrl ?? null });
        this.carregando = false;
      },
      error: () => { this.carregando = false; }
    });
  }

  aoTrocarFoto(url: string | null): void {
    this.formDados.get('fotoUrl')?.setValue(url);
    this.formDados.markAsDirty();
  }

  salvarDados(): void {
    if (this.formDados.invalid || !this.usuarioId || !this.funcionarioAtual) return;
    this.salvandoDados = true;
    this.erroDados = '';
    this.sucessoDados = '';

    const dados: Funcionario = {
      ...this.funcionarioAtual,
      nome: this.formDados.value.nome,
      email: this.formDados.value.email,
      fotoUrl: this.formDados.value.fotoUrl,
    };

    this.funcionarioService.atualizar(this.usuarioId, dados, contextoSemToast()).subscribe({
      next: (atualizado) => {
        this.funcionarioAtual = atualizado;
        this.auth.atualizarUsuarioLocal({
          nome: atualizado.nome, email: atualizado.email, fotoUrl: atualizado.fotoUrl ?? null,
        });
        this.sucessoDados = 'Dados atualizados com sucesso.';
        this.salvandoDados = false;
      },
      error: (err) => {
        this.erroDados = mensagemDeErro(err);
        this.salvandoDados = false;
      }
    });
  }

  salvarSenha(): void {
    if (this.formSenha.invalid || !this.usuarioId) return;

    const { senhaAtual, novaSenha, confirmar } = this.formSenha.value;
    this.erroSenha = '';
    this.sucessoSenha = '';

    if (novaSenha !== confirmar) {
      this.erroSenha = 'A confirmação não bate com a nova senha.';
      return;
    }

    this.salvandoSenha = true;
    this.funcionarioService.alterarSenha(this.usuarioId, senhaAtual, novaSenha, contextoSemToast()).subscribe({
      next: () => {
        this.sucessoSenha = 'Senha alterada com sucesso.';
        this.formSenha.reset();
        this.salvandoSenha = false;
      },
      error: (err) => {
        this.erroSenha = mensagemDeErro(err);
        this.salvandoSenha = false;
      }
    });
  }
}
