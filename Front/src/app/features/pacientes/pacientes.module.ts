import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PacientesListaComponent } from './lista/pacientes-lista.component';
import { PacientesPerfilComponent } from './perfil/pacientes-perfil.component';

const routes: Routes = [
  { path: '',    component: PacientesListaComponent },
  { path: ':id', component: PacientesPerfilComponent },
];

@NgModule({
  declarations: [PacientesListaComponent, PacientesPerfilComponent],
  imports: [CommonModule, SharedModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class PacientesModule {}
