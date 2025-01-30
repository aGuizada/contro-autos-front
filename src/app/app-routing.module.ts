import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // //{
  //   path: '',
  //   redirectTo: '/login', // Redirige a la página de login al iniciar
  //   pathMatch: 'full'
  // },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./perfil/perfil.module').then(m => m.PerfilPageModule)
  },
  {
    path: 'cargar-qr',
    loadChildren: () => import('./cargar-qr/cargar-qr.module').then(m => m.CargarQrPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminPageModule)
  },
  {
    path: 'crear-usuarios',
    loadChildren: () => import('./crear-usuarios/crear-usuarios.module').then(m => m.CrearUsuariosPageModule)
  },
  {
    path: 'listar-usuarios',
    loadChildren: () => import('./listar-usuarios/listar-usuarios.module').then(m => m.ListarUsuariosPageModule)
  },
  {
    path: 'reportes',
    loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesPageModule)
  },
  {
    path: 'comunidad',
    loadChildren: () => import('./comunidad/comunidad.module').then( m => m.ComunidadPageModule)
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
