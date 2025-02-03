import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';  // Asegúrate de que IonicModule esté importado

import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,  // Asegúrate de incluir IonicModule en imports
    DashboardPageRoutingModule,
    DashboardPage
  ],
  declarations: []  // Declara el componente DashboardPage aquí
})
export class DashboardPageModule {}
