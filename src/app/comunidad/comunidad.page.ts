import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  templateUrl: './comunidad.page.html',
  styleUrls: ['./comunidad.page.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ComunidadPage {
  comunidades: any[] = [];
  comunidadForm: FormGroup;
  mostrarModal = false;
  editando = false;
  comunidadEditandoId: number | null = null; // Almacenar ID al editar

  // Variables para la paginación
  itemsPerPage = 7;
  currentPage = 1;

  constructor(private serviciosService: ServiciosService, private fb: FormBuilder) {
    this.comunidadForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getComunidades();
  }

  // Obtener todas las comunidades
  getComunidades() {
    this.serviciosService.getComunidades().subscribe(
      (data) => {
        this.comunidades = data;
      },
      (error) => {
        console.error('Error al obtener comunidades', error);
      }
    );
  }

  // Paginación
  getPaginatedComunidades() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.comunidades.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.comunidades.length / this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // Abrir modal
  abrirModal() {
    this.mostrarModal = true;
    this.editando = false;
    this.comunidadEditandoId = null;
    this.inicializarFormulario();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.comunidadForm.reset();
  }

  inicializarFormulario() {
    this.comunidadForm.reset();
  }

  // Crear comunidad
  crearComunidad() {
    if (this.comunidadForm.valid) {
      this.serviciosService.crearComunidad(this.comunidadForm.value).subscribe(
        () => {
          this.getComunidades();
          this.cerrarModal();
          alert('Se registró correctamente la comunidad.');
        },
        (error) => console.error('Error al crear la comunidad', error)
      );
    }
  }

  // Editar comunidad
  editarComunidad(id: number) {
    const comunidad = this.comunidades.find(c => c.id === id);
    if (comunidad) {
      this.comunidadForm.setValue({ nombre: comunidad.nombre });
      this.comunidadEditandoId = id;
      this.editando = true;
      this.mostrarModal = true;
    }
  }

  // Actualizar comunidad
  actualizarComunidad(id: number) {
    if (this.comunidadForm.valid) {
      this.serviciosService.actualizarComunidad(id, this.comunidadForm.value).subscribe(
        () => {
          this.getComunidades();
          this.cerrarModal();
          alert('Se actualizó correctamente la comunidad.');
        },
        (error) => console.error('Error al actualizar la comunidad', error)
      );
    }
  }

  // Guardar comunidad (crear o actualizar)
  guardarComunidad() {
    if (this.editando && this.comunidadEditandoId) {
      this.actualizarComunidad(this.comunidadEditandoId);
    } else {
      this.crearComunidad();
    }
  }

  // Eliminar comunidad con confirmación
  eliminarComunidad(id: number) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta comunidad?');
    if (confirmacion) {
      this.serviciosService.eliminarComunidad(id).subscribe(
        () => {
          this.getComunidades();
          alert('Comunidad eliminada correctamente.');
        },
        (error) => console.error('Error al eliminar la comunidad', error)
      );
    }
  }
}
