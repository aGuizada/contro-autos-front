import { Component, OnInit } from '@angular/core';
import { ServiciosService } from 'src/app/services/servicios.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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
  registrosPaginados: any[] = []; // Para mostrar solo los registros de la página actual
  loading: boolean = true;
  error: string | null = null;
  esAdmin: boolean = false;

  // Variables de paginación
  currentPage: number = 1;
  pageSize: number = 5; // Cantidad de registros por página

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
        this.paginarRegistros(); // Actualiza la paginación
      },
      (error) => {
        console.error('Error al cargar registros de carga', error);
        this.error = 'No se pudieron cargar los registros de carga';
        this.loading = false;
      }
    );
  }

  get totalPages(): number {
    return Math.ceil(this.registrosCarga.length / this.pageSize);
  }

  paginarRegistros() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.registrosPaginados = this.registrosCarga.slice(start, end);
  }

  paginaAnterior() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginarRegistros();
    }
  }

  paginaSiguiente() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginarRegistros();
    }
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
