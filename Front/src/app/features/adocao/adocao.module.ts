import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AdocaoComponent } from './adocao.component';

const routes: Routes = [{ path: '', component: AdocaoComponent }];

@NgModule({
  declarations: [AdocaoComponent],
  imports: [CommonModule, SharedModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class AdocaoModule {}
