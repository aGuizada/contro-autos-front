import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';
import { ReactiveFormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    FormsModule,
    ReactiveFormsModule
  ]
})
export class Tab2Page implements OnInit, OnDestroy {
  registrosCarga: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  esAdmin: boolean = false;
  private pollingSubscription!: Subscription; // Para manejar la suscripción al polling

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit() {
    this.verificarRolAdmin();
    this.iniciarPolling(); // Iniciar el polling para actualizar los registros en tiempo real
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe(); // Limpiar la suscripción al destruir el componente
    }
  }

  verificarRolAdmin() {
    this.serviciosService.getUserRole().subscribe(
      (response) => {
        this.esAdmin = response.role === 'admin';
        this.cargarHistorialCargas();
      },
      (error) => {
        console.error('Error al verificar rol', error);
        this.cargarHistorialCargas(); // Cargar de todos modos
      }
    );
  }

  cargarHistorialCargas() {
    this.loading = true;
    this.serviciosService.getRegistrosCarga().subscribe(
      (data) => {
        this.registrosCarga = data.sort((a: any, b: any) =>
          new Date(b.fecha_carga).getTime() - new Date(a.fecha_carga).getTime()
        );
        this.loading = false;
      },
      (error) => {
        console.error('Error al cargar registros de carga', error);
        this.error = 'No se pudieron cargar los registros de carga';
        this.loading = false;
      }
    );
  }

  iniciarPolling() {
    // Realizar una consulta cada 5 segundos (ajusta el intervalo según tus necesidades)
    this.pollingSubscription = interval(5000)
      .pipe(
        switchMap(() => this.serviciosService.getRegistrosCarga())
      )
      .subscribe(
        (data) => {
          this.registrosCarga = data.sort((a: any, b: any) =>
            new Date(b.fecha_carga).getTime() - new Date(a.fecha_carga).getTime()
          );
        },
        (error) => {
          console.error('Error durante el polling', error);
          this.error = 'Error al actualizar los registros de carga';
        }
      );
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES', {
      timeZone: 'America/La_Paz', // Asegura la zona horaria de Bolivia
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}