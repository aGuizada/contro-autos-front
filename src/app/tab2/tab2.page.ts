import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    FormsModule
  ]
})
export class Tab2Page implements OnInit {
  registrosCarga: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit() {
    this.cargarHistorialCargas();
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
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}