import { Component, OnInit } from '@angular/core';
import { ServiciosService } from 'src/app/services/servicios.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportesPage implements OnInit {


  registrosCarga: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  esAdmin: boolean = false;
  constructor(private serviciosService: ServiciosService) {}

  ngOnInit() {
    this.cargarHistorialCargas();
    this.verificarRolAdmin();
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
