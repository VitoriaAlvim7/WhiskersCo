import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { EstoqueComponent } from './estoque.component';

const routes: Routes = [{ path: '', component: EstoqueComponent }];

@NgModule({
  declarations: [EstoqueComponent],
  imports: [CommonModule, SharedModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class EstoqueModule {}
