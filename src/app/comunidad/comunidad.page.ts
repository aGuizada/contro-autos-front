import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  templateUrl: './comunidad.page.html',
  styleUrls: ['./comunidad.page.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ComunidadPage {
  comunidades: any[] = [];
  comunidadForm: FormGroup;
  mostrarModal = false;
  editando = false;

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

  // Paginación: obtener las comunidades de la página actual
  getPaginatedComunidades() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.comunidades.slice(start, end);
  }

  // Obtener el total de páginas
  getTotalPages(): number {
    return Math.ceil(this.comunidades.length / this.itemsPerPage);
  }

  // Cambiar a la página anterior
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Cambiar a la página siguiente
  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // Abrir modal
  abrirModal() {
    this.mostrarModal = true;
    this.editando = false;
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
        },
        (error) => console.error('Error al actualizar la comunidad', error)
      );
    }
  }

  // Guardar comunidad (crear o actualizar)
  guardarComunidad() {
    if (this.editando) {
      const id = this.comunidades.find(c => c.nombre === this.comunidadForm.value.nombre)?.id;
      if (id) {
        this.actualizarComunidad(id);
      }
    } else {
      this.crearComunidad();
    }
  }

  // Eliminar comunidad
  eliminarComunidad(id: number) {
    this.serviciosService.eliminarComunidad(id).subscribe(
      () => this.getComunidades(),
      (error) => console.error('Error al eliminar la comunidad', error)
    );
  }
}
