import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { CadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  { path: '', component: LoginComponent, data: { titulo: 'Entrar' } },
  { path: 'cadastro', component: CadastroComponent, data: { titulo: 'Criar conta' } },
];

@NgModule({
  declarations: [LoginComponent, CadastroComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule.forChild(routes)],
})
export class AuthModule {}
