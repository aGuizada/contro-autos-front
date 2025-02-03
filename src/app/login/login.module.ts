import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LoginPageRoutingModule } from './login-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
// Importa el componente como un módulo standalone
import { LoginPage } from './login.page';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    IonicModule,  
    LoginPageRoutingModule,
    RouterModule,
    LoginPage,  // Agregar el componente standalone en imports
  ]
})
export class LoginPageModule {}
