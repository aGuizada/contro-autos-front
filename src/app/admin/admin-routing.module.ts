import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'cargar-qr',
        loadChildren: () => import('../cargar-qr/cargar-qr.module').then(m => m.CargarQrPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: 'crear-usuarios',
        loadChildren: () => import('../crear-usuarios/crear-usuarios.module').then(m => m.CrearUsuariosPageModule)
      },
      {
        path: 'listar-usuarios',
        loadChildren: () => import('../listar-usuarios/listar-usuarios.module').then(m => m.ListarUsuariosPageModule)
      },
      {
        path: 'reportes',
        loadChildren: () => import('../reportes/reportes.module').then(m => m.ReportesPageModule)
      },
      {
        path: 'comunidad',
        loadChildren: () => import('../comunidad/comunidad.module').then( m => m.ComunidadPageModule)
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
