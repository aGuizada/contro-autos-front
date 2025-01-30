import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListarUsuariosPageRoutingModule } from './listar-usuarios-routing.module';

import { ListarUsuariosPage } from './listar-usuarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListarUsuariosPageRoutingModule,
    ListarUsuariosPage
  ],
  declarations: []
})
export class ListarUsuariosPageModule {}
