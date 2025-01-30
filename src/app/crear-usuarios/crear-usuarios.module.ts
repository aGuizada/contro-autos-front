import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { CrearUsuariosPageRoutingModule } from './crear-usuarios-routing.module';

import { CrearUsuariosPage } from './crear-usuarios.page';
import { QRCodeComponent } from 'angularx-qrcode'; // Aquí importas el QRCodeComponent

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearUsuariosPageRoutingModule,
    CrearUsuariosPage,
    ReactiveFormsModule,
    QRCodeComponent
  ],
  declarations: []
})
export class CrearUsuariosPageModule {}
