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
  rol_id: number;
  comunidad_id: number;
  qrData?: string;
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
  roles: any[] = [];
  comunidades: any[] = [];
  usuarios: Usuario[] = [];
  editando: boolean = false;
  usuarioIdEditando: number | null = null;
  mostrarModal: boolean = false;
  usuarioSeleccionado: Usuario | null = null;
  // Paginación
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
      rol_id: ['', [Validators.required]],
      comunidad_id: ['', [Validators.required]]
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
    return `Nombre: ${usuario.nombre}\nComunidad: ${comunidad}`;
  }

  crearUsuario() {
    if (this.usuarioForm.valid) {
      this.serviciosService.crearUsuario(this.usuarioForm.value).subscribe(
        (response: Usuario) => {
          const nuevoUsuario = {
            ...response,
            qrData: this.generateQRData(response)
          };
          this.usuarios.push(nuevoUsuario);
          Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        (error) => {
          console.error('Error:', error);
          Swal.fire('Error', 'No se pudo crear el usuario', 'error');
        }
      );
    }
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol_id: usuario.rol_id,
      comunidad_id: usuario.comunidad_id
    });
    this.usuarioIdEditando = usuario.id;
    this.editando = true;
    this.mostrarModal = true;
  }

  actualizarUsuario() {
    if (this.usuarioIdEditando && this.usuarioForm.valid) {
      this.serviciosService.actualizarUsuario(this.usuarioIdEditando, this.usuarioForm.value).subscribe(
        () => {
          Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
          this.cargarUsuarios();
          this.cerrarModal();
          this.editando = false;
          this.usuarioIdEditando = null;
        },
        (error) => {
          console.error('Error:', error);
          Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
        }
      );
    }
  }

  eliminarUsuario(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviciosService.eliminarUsuario(id).subscribe(() => {
          Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
          this.cargarUsuarios();
        });
      }
    });
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