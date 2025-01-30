import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ComunidadPageRoutingModule } from './comunidad-routing.module';

import { ComunidadPage } from './comunidad.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComunidadPageRoutingModule,
    ReactiveFormsModule, 
    ComunidadPage
    // Módulo necesario para formularios reactivos
  ],

})
export class ComunidadPageModule {}
