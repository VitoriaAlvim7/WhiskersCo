import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PerfilComponent } from './perfil.component';

const routes: Routes = [{ path: '', component: PerfilComponent }];

@NgModule({
  declarations: [PerfilComponent],
  imports: [CommonModule, SharedModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class PerfilModule {}
