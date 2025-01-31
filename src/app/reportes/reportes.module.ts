import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportesPageRoutingModule } from './reportes-routing.module';
import { ReactiveFormsModule } from '@angular/forms'; 
import { ReportesPage } from './reportes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule ,
    ReportesPageRoutingModule,
    ReportesPage
  ],
  declarations: []
})
export class ReportesPageModule {}
