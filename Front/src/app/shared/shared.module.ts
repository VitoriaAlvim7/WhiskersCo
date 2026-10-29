import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { IconComponent } from './components/icon/icon.component';
import { AuthBrandPanelComponent } from './components/auth-brand-panel/auth-brand-panel.component';
import { CampoSenhaComponent } from './components/campo-senha/campo-senha.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { PaginacaoComponent } from './components/paginacao/paginacao.component';
import { PacienteFormModalComponent } from './components/paciente-form-modal/paciente-form-modal.component';
import { TutorFormModalComponent } from './components/tutor-form-modal/tutor-form-modal.component';
import { UploadFotoComponent } from './components/upload-foto/upload-foto.component';
import { ModalAcessivelDirective } from './directives/modal-acessivel.directive';

@NgModule({
  declarations: [
    SidebarComponent,
    BackButtonComponent,
    IconComponent,
    AuthBrandPanelComponent,
    CampoSenhaComponent,
    ToastContainerComponent,
    ConfirmDialogComponent,
    PaginacaoComponent,
    PacienteFormModalComponent,
    TutorFormModalComponent,
    UploadFotoComponent,
    ModalAcessivelDirective,
  ],
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  exports: [
    SidebarComponent,
    BackButtonComponent,
    IconComponent,
    AuthBrandPanelComponent,
    CampoSenhaComponent,
    ToastContainerComponent,
    ConfirmDialogComponent,
    PaginacaoComponent,
    PacienteFormModalComponent,
    TutorFormModalComponent,
    UploadFotoComponent,
    ModalAcessivelDirective,
  ],
})
export class SharedModule {}
