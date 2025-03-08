import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'perfil',
    canActivate: [AuthGuard],
    loadChildren: () => import('./perfil/perfil.module').then(m => m.PerfilPageModule)
  },
  {
    path: 'cargar-qr',
    canActivate: [AuthGuard],
    loadChildren: () => import('./cargar-qr/cargar-qr.module').then(m => m.CargarQrPageModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminPageModule)
  },
  {
    path: 'crear-usuarios',
    canActivate: [AuthGuard],
    loadChildren: () => import('./crear-usuarios/crear-usuarios.module').then(m => m.CrearUsuariosPageModule)
  },
  {
    path: 'listar-usuarios',
    canActivate: [AuthGuard],
    loadChildren: () => import('./listar-usuarios/listar-usuarios.module').then(m => m.ListarUsuariosPageModule)
  },
  {
    path: 'reportes',
    canActivate: [AuthGuard],
    loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesPageModule)
  },
  {
    path: 'comunidad',
    canActivate: [AuthGuard],
    loadChildren: () => import('./comunidad/comunidad.module').then(m => m.ComunidadPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }