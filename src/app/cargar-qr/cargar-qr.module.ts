import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { CargarQrPageRoutingModule } from './cargar-qr-routing.module';

import { CargarQrPage } from './cargar-qr.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CargarQrPage,
    ZXingScannerModule, 
    CargarQrPageRoutingModule
  ],
  declarations: [],
})
export class CargarQrPageModule {}
