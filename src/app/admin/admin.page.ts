import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenu,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonRouterOutlet,
  MenuController, // Importa MenuController
} from '@ionic/angular/standalone';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { addIcons } from 'ionicons';
import { homeOutline, qrCodeOutline, peopleOutline, personAddOutline, barChartOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenu,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonRouterOutlet,
  ],
})
export class AdminPage implements OnInit {
  constructor(private menuCtrl: MenuController) { // Inyecta MenuController
    addIcons({ homeOutline, qrCodeOutline, peopleOutline, personAddOutline, barChartOutline, personCircleOutline });
  }

  ngOnInit() {}


  closeMenu() {
    this.menuCtrl.close('main-content')
      .then(() => console.log('Menú cerrado correctamente')) // Verifica en la consola
      .catch((err) => console.error('Error al cerrar el menú:', err)); // Captura errores
  }
}