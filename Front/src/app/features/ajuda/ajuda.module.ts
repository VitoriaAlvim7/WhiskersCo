import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AjudaComponent } from './ajuda.component';

const routes: Routes = [{ path: '', component: AjudaComponent }];

@NgModule({
  declarations: [AjudaComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class AjudaModule {}
