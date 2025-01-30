import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CargarQrPage } from './cargar-qr.page';

const routes: Routes = [
  {
    path: '',
    component: CargarQrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CargarQrPageRoutingModule {}
