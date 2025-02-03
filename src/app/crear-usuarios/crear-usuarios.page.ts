import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiciosService } from 'src/app/services/servicios.service';
import Swal from 'sweetalert2';
import { QRCodeComponent } from 'angularx-qrcode';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol_id: number;
  comunidad_id: number;
  numero_chasis?: string;
  marca?: string;  // Add these properties
  modelo?: string;
  imagen?: string;
  qrData?: string;
  auto?: Auto;
}

interface Auto {
  id?: number;
  marca: string;
  modelo: string;
  placa: string;
  numero_chasis?: string;
  usuario_id?: number;
}

@Component({
  standalone: true,
  selector: 'app-crear-usuarios',
  templateUrl: './crear-usuarios.page.html',
  styleUrls: ['./crear-usuarios.page.scss'],
  imports: [CommonModule, ReactiveFormsModule, QRCodeComponent]
})
export class CrearUsuariosPage implements OnInit {
  usuarioForm!: FormGroup;
  autoForm!: FormGroup;
  roles: any[] = [];
  comunidades: any[] = [];
  usuarios: Usuario[] = [];
  editando: boolean = false;
  usuarioIdEditando: number | null = null;
  mostrarModal: boolean = false;
  usuarioSeleccionado: Usuario | null = null;
  paginaActual: number = 1;
  itemsPorPagina: number = 5;
  totalPaginas: number = 0;

  constructor(
    private fb: FormBuilder,
    private serviciosService: ServiciosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDatos();
  }

  // Getters para paginación
  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.usuarios.slice(inicio, fin);
  }

  get paginas(): number[] {
    const totalPaginas = Math.ceil(this.usuarios.length / this.itemsPorPagina);
    return Array(totalPaginas).fill(0).map((_, index) => index + 1);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.paginas.length) {
      this.paginaActual = pagina;
    }
  }

  inicializarFormulario() {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      telefono: [''], // Optional field
      rol_id: ['', [Validators.required]],
      comunidad_id: ['', [Validators.required]],
      numero_chasis: [''], // Optional field for auto
      marca: [''], // Optional field for auto
      modelo: [''], // Optional field for auto
      imagen: [''] // Optional field for image
    });
  }
 // Método para abrir el modal con la información detallada del usuario
 verUsuario(usuario: Usuario) {
  this.usuarioSeleccionado = usuario;
  this.mostrarModal = true;
}

// Método para cerrar el modal de usuario
cerrarModalUsuario() {
  this.usuarioSeleccionado = null;
  this.mostrarModal = false;
}
  abrirModal() {
    this.mostrarModal = true;
    this.editando = false;
    this.inicializarFormulario();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioForm.reset();
  }

  cargarDatos() {
    this.serviciosService.getRoles().subscribe((roles) => {
      this.roles = roles;
    });

    this.serviciosService.getComunidades().subscribe((comunidades) => {
      this.comunidades = comunidades;
    });

    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.serviciosService.getUsuarios().subscribe((usuarios: Usuario[]) => {
      this.usuarios = usuarios.map((usuario: Usuario) => ({
        ...usuario,
        qrData: this.generateQRData(usuario)
      }));
      this.totalPaginas = Math.ceil(this.usuarios.length / this.itemsPorPagina);
      // Asegurarse de que la página actual es válida
      if (this.paginaActual > this.totalPaginas) {
        this.paginaActual = 1;
      }
    });
  }
  generateQRData(usuario: Usuario): string {
    const comunidad = this.getComunidadNombre(usuario.comunidad_id);
    const rol = this.getRolNombre(usuario.rol_id);
    return `Nombre: ${usuario.nombre}
  Email: ${usuario.email}
  Teléfono: ${usuario.telefono || 'N/A'}
  Comunidad: ${comunidad}
  Rol: ${rol}
  Número de Chasis: ${usuario.numero_chasis || 'N/A'}
  Marca: ${usuario.marca || 'N/A'}
  Modelo: ${usuario.modelo || 'N/A'}`;
  }

  crearUsuario() {
    if (this.usuarioForm.valid) {
      const usuarioData = {
        ...this.usuarioForm.value,
        auto: {
          numero_chasis: this.usuarioForm.get('numero_chasis')?.value,
          marca: this.usuarioForm.get('marca')?.value,
          modelo: this.usuarioForm.get('modelo')?.value
        }
      };
  
      this.serviciosService.crearUsuario(usuarioData).subscribe(
        (response: Usuario) => {
          const nuevoUsuario = {
            ...response,
            qrData: this.generateQRData(response)
          };
          this.usuarios.push(nuevoUsuario);
          alert('Usuario creado correctamente');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        (error) => {
          console.error('Error:', error);
          alert('No se pudo crear el usuario');
        }
      );
    }
  }
  editarUsuario(usuario: Usuario) {
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      telefono: usuario.telefono || '',
      rol_id: usuario.rol_id,
      comunidad_id: usuario.comunidad_id,
      numero_chasis: usuario.auto?.numero_chasis || '',
      marca: usuario.auto?.marca || '',
      modelo: usuario.auto?.modelo || '',
      imagen: '' // You might want to handle image differently
    });
    this.usuarioIdEditando = usuario.id;
    this.editando = true;
    this.mostrarModal = true;
  }

  actualizarUsuario() {
    if (this.usuarioIdEditando && this.usuarioForm.valid) {
      this.serviciosService.actualizarUsuario(this.usuarioIdEditando, this.usuarioForm.value).subscribe(
        () => {
          alert('Usuario actualizado correctamente');
          this.cargarUsuarios();
          this.cerrarModal();
          this.editando = false;
          this.usuarioIdEditando = null;
        },
        (error) => {
          console.error('Error:', error);
          alert('No se pudo actualizar el usuario');
        }
      );
    }
  }


  eliminarUsuario(id: number) {
    const confirmacion = confirm('¿Estás seguro de eliminar este usuario?');
    if (confirmacion) {
      this.serviciosService.eliminarUsuario(id).subscribe(
        () => {
          alert('Usuario eliminado correctamente');
          this.cargarUsuarios();
        },
        (error) => {
          console.error('Error al eliminar:', error);
          alert('No se pudo eliminar el usuario');
        }
      );
    }
  }

  getRolNombre(rolId: number): string {
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.nombre : '';
  }

  getComunidadNombre(comunidadId: number): string {
    const comunidad = this.comunidades.find(c => c.id === comunidadId);
    return comunidad ? comunidad.nombre : '';
  }
}