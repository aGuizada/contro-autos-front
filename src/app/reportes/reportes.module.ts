import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportesPageRoutingModule } from './reportes-routing.module';
import { ReactiveFormsModule } from '@angular/forms'; 
import { ReportesPage } from './reportes.page';
import { QRCodeComponent } from 'angularx-qrcode';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule ,
    ReportesPageRoutingModule,
    QRCodeComponent, 
    ReportesPage
  ],
  declarations: []
})
export class ReportesPageModule {}
