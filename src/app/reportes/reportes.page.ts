import { Component, OnInit } from '@angular/core';
import { ServiciosService } from 'src/app/services/servicios.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ReportesPage implements OnInit {

  autos: any[] = [];
  autoSeleccionado: any = null;
  autoForm: FormGroup;
  imagenSeleccionada: File | null = null;
  usuarios: any[] = [];
  usuarioId: number = 0;

  constructor(private autoService: ServiciosService, private fb: FormBuilder) {
    this.autoForm = this.fb.group({
      numero_chasis: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      imagen: [null, Validators.required],
      usuario_id: [this.usuarioId, Validators.required]
    });
  }

  ngOnInit() {
    this.obtenerAutos();
    this.obtenerUsuarios();
  }

  obtenerAutos() {
    this.autoService.getAutos().subscribe(data => {
      this.autos = data;
    }, error => {
      console.error('Error al obtener autos', error);
    });
  }

  obtenerUsuarios() {
    this.autoService.getUsuarios().subscribe(data => {
      this.usuarios = data;
    }, error => {
      console.error('Error al obtener usuarios', error);
    });
  }

  verAuto(id: number) {
    this.autoService.getAuto(id).subscribe(data => {
      this.autoSeleccionado = data;
    }, error => {
      console.error('Error al obtener auto', error);
    });
  }

  eliminarAuto(id: number) {
    this.autoService.eliminarAuto(id).subscribe(() => {
      this.autos = this.autos.filter(auto => auto.id !== id);
    }, error => {
      console.error('Error al eliminar auto', error);
    });
  }

  seleccionarImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
    }
  }

  // Editar Auto
  editarAuto(auto: any) {
    this.autoSeleccionado = auto;
    this.autoForm.patchValue({
      numero_chasis: auto.numero_chasis,
      marca: auto.marca,
      modelo: auto.modelo,
      usuario_id: auto.usuario_id
    });
    this.imagenSeleccionada = null; // Aquí no cargamos la imagen, pero puedes agregarlo si es necesario
  }

  // Crear o Actualizar Auto
  crearAuto() {
    const formData = new FormData();
    formData.append('numero_chasis', this.autoForm.value.numero_chasis);
    formData.append('marca', this.autoForm.value.marca);
    formData.append('modelo', this.autoForm.value.modelo);
    formData.append('usuario_id', this.autoForm.value.usuario_id.toString());

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    this.autoService.crearAuto(formData).subscribe(response => {
      alert('Auto creado correctamente.');
      this.autoForm.reset();
      this.obtenerAutos();
    }, error => {
      console.error('Error al crear auto', error);
      alert('Error al crear el auto.');
    });
  }

  // Actualizar Auto
  actualizarAuto() {
    const formData = new FormData();
    formData.append('numero_chasis', this.autoForm.value.numero_chasis);
    formData.append('marca', this.autoForm.value.marca);
    formData.append('modelo', this.autoForm.value.modelo);
    formData.append('usuario_id', this.autoForm.value.usuario_id.toString());

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    this.autoService.actualizarAuto(this.autoSeleccionado.id, formData).subscribe(response => {
      alert('Auto actualizado correctamente.');
      this.autoForm.reset();
      this.autoSeleccionado = null;
      this.obtenerAutos();
    }, error => {
      console.error('Error al actualizar auto', error);
      alert('Error al actualizar el auto.');
    });
  }
}
