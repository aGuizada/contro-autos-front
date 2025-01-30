import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importa ReactiveFormsModule
import { ServiciosService } from '../services/servicios.service';

@Component({
  selector: 'app-comunidad',
  standalone: true,  // Marca el componente como independiente
  templateUrl: './comunidad.page.html',
  styleUrls: ['./comunidad.page.scss'],
  imports: [CommonModule, ReactiveFormsModule]  // Importa ReactiveFormsModule aquí
})
export class ComunidadPage {
  comunidades: any[] = [];
  comunidadForm: FormGroup;  // Formulario para crear/editar comunidad
  editMode = false;  // Bandera para determinar si es modo de edición

  constructor(private serviciosService: ServiciosService, private fb: FormBuilder) {
    this.comunidadForm = this.fb.group({
      nombre: ['', Validators.required]  // Define el formulario con un solo campo "nombre"
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

  // Crear una nueva comunidad
  crearComunidad() {
    if (this.comunidadForm.valid) {
      this.serviciosService.crearComunidad(this.comunidadForm.value).subscribe(
        (data) => {
          console.log('Comunidad creada', data);
          this.getComunidades(); // Volver a cargar la lista de comunidades
          this.comunidadForm.reset(); // Resetear formulario
        },
        (error) => {
          console.error('Error al crear la comunidad', error);
        }
      );
    }
  }

  // Editar una comunidad
  editarComunidad(id: number) {
    const comunidad = this.comunidades.find(c => c.id === id);
    if (comunidad) {
      this.comunidadForm.setValue({
        nombre: comunidad.nombre
      });
      this.editMode = true;  // Habilitar modo de edición
    }
  }

  // Actualizar una comunidad
  actualizarComunidad(id: number) {
    if (this.comunidadForm.valid) {
      this.serviciosService.actualizarComunidad(id, this.comunidadForm.value).subscribe(
        (data) => {
          console.log('Comunidad actualizada', data);
          this.getComunidades(); // Volver a cargar la lista de comunidades
          this.comunidadForm.reset(); // Resetear formulario
          this.editMode = false;  // Deshabilitar modo de edición
        },
        (error) => {
          console.error('Error al actualizar la comunidad', error);
        }
      );
    }
  }

  // Eliminar una comunidad
  eliminarComunidad(id: number) {
    this.serviciosService.eliminarComunidad(id).subscribe(
      (data) => {
        console.log('Comunidad eliminada', data);
        this.getComunidades(); // Volver a cargar la lista de comunidades
      },
      (error) => {
        console.error('Error al eliminar la comunidad', error);
      }
    );
  }

  // Método que maneja la creación o actualización
  guardarComunidad() {
    if (this.editMode) {
      const id = this.comunidades.find(c => c.nombre === this.comunidadForm.value.nombre)?.id;
      if (id) {
        this.actualizarComunidad(id);
      }
    } else {
      this.crearComunidad();
    }
  }
}
