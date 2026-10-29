import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    data: { titulo: 'Dashboard' },
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  {
    path: 'pacientes',
    canActivate: [AuthGuard],
    data: { titulo: 'Pacientes' },
    loadChildren: () =>
      import('./features/pacientes/pacientes.module').then(m => m.PacientesModule)
  },

  {
    path: 'tutores',
    canActivate: [AuthGuard],
    data: { titulo: 'Tutores' },
    loadChildren: () =>
      import('./features/tutores/tutores.module').then(m => m.TutoresModule)
  },

  {
    path: 'agenda',
    canActivate: [AuthGuard],
    data: { titulo: 'Agenda' },
    loadChildren: () =>
      import('./features/agenda/agenda.module').then(m => m.AgendaModule)
  },

  {
    path: 'funcionarios',
    canActivate: [AuthGuard],
    data: { titulo: 'Funcionários' },
    loadChildren: () =>
      import('./features/funcionarios/funcionarios.module').then(m => m.FuncionariosModule)
  },

  {
    path: 'estoque',
    canActivate: [AuthGuard],
    data: { titulo: 'Estoque' },
    loadChildren: () =>
      import('./features/estoque/estoque.module').then(m => m.EstoqueModule)
  },

  {
    path: 'adocao',
    canActivate: [AuthGuard],
    data: { titulo: 'Adoção' },
    loadChildren: () =>
      import('./features/adocao/adocao.module').then(m => m.AdocaoModule)
  },

  {
    path: 'receituarios',
    canActivate: [AuthGuard],
    data: { titulo: 'Receituários' },
    loadChildren: () =>
      import('./features/receituarios/receituarios.module').then(m => m.ReceituariosModule)
  },

  {
    path: 'caixa',
    canActivate: [AuthGuard],
    data: { titulo: 'Caixa' },
    loadChildren: () =>
      import('./features/caixa/caixa.module').then(m => m.CaixaModule)
  },

  {
    path: 'perfil',
    canActivate: [AuthGuard],
    data: { titulo: 'Meu Perfil' },
    loadChildren: () =>
      import('./features/perfil/perfil.module').then(m => m.PerfilModule)
  },

  {
    path: 'configuracoes',
    canActivate: [AuthGuard],
    data: { titulo: 'Configurações' },
    loadChildren: () =>
      import('./features/configuracoes/configuracoes.module').then(m => m.ConfiguracoesModule)
  },

  {
    path: 'ajuda',
    canActivate: [AuthGuard],
    data: { titulo: 'Ajuda' },
    loadChildren: () =>
      import('./features/ajuda/ajuda.module').then(m => m.AjudaModule)
  },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
