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
   
  }

  
}
