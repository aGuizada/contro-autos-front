import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ServiciosService } from 'src/app/services/servicios.service';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol_id: number;
  comunidad_id: number;
  numero_chasis?: string;
  marca?: string;
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
  imports: [CommonModule, ReactiveFormsModule, QRCodeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CrearUsuariosPage implements OnInit {
  // Nuevo: Variable para manejar los pasos
  pasoActual: number = 1;

  // Forms
  usuarioForm!: FormGroup;

  // Data arrays
  roles: any[] = [];
  comunidades: any[] = [];
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  // UI states
  searchTerm = '';
  editando = false;
  usuarioIdEditando: number | null = null;
  mostrarModal = false;
  usuarioSeleccionado: Usuario | null = null;

  // Pagination
  paginaActual = 1;
  itemsPorPagina = 5;

  constructor(
    private fb: FormBuilder,
    private serviciosService: ServiciosService
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Nuevo: Métodos para manejar los pasos
  siguientePaso(): void {
    if (this.pasoActual < 3) {
      if (this.validarPasoActual()) {
        this.pasoActual++;
      }
    }
  }

  anteriorPaso(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  private validarPasoActual(): boolean {
    const controls = this.usuarioForm.controls;
    
    switch (this.pasoActual) {
      case 1:
        return controls['nombre'].valid && 
               controls['email'].valid && 
               (!this.editando ? controls['password'].valid : true);
      case 2:
        return controls['rol_id'].valid && 
               controls['comunidad_id'].valid;
      case 3:
        return true;
      default:
        return false;
    }
  }

  // Form initialization
  private inicializarFormulario(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      telefono: [''],
      rol_id: ['', [Validators.required]],
      comunidad_id: ['', [Validators.required]],
      numero_chasis: [''],
      marca: [''],
      modelo: [''],
      imagen: ['']
    });

    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    this.usuarioForm.get('nombre')?.valueChanges.subscribe(nombre => {
      if (nombre) {
        const email = this.generarEmail(nombre);
        this.usuarioForm.patchValue({ email }, { emitEvent: false });
      }
    });
  }

  // Getters for template
  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, fin);
  }

  get paginas(): number[] {
    const totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
    return Array(totalPaginas).fill(0).map((_, index) => index + 1);
  }

  // Data loading methods
  private cargarDatos(): void {
    this.cargarRoles();
    this.cargarComunidades();
    this.cargarUsuarios();
  }

  private cargarRoles(): void {
    this.serviciosService.getRoles().subscribe(roles => {
      this.roles = roles;
    });
  }

  private cargarComunidades(): void {
    this.serviciosService.getComunidades().subscribe(comunidades => {
      this.comunidades = comunidades;
    });
  }

  private cargarUsuarios(): void {
    this.serviciosService.getUsuarios().subscribe((usuarios: Usuario[]) => {
      this.usuarios = usuarios.map(usuario => ({
        ...usuario,
        qrData: this.generateQRData(usuario)
      }));
      this.usuariosFiltrados = [...this.usuarios];
    });
  }

  // User CRUD operations
  crearUsuario(): void {
    if (this.usuarioForm.valid) {
      const usuarioData = this.prepararDatosUsuario();
      
      this.serviciosService.crearUsuario(usuarioData).subscribe({
        next: (response: Usuario) => {
          this.manejarCreacionExitosa(response);
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          alert('No se pudo crear el usuario');
        }
      });
    }
  }
  editarUsuario(usuario: Usuario): void {
    this.usuarioIdEditando = usuario.id;
    this.editando = true;
    this.mostrarModal = true;
    this.pasoActual = 1; // Nuevo: Reset paso al editar

    const formData = {
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono || '',
      rol_id: usuario.rol_id,
      comunidad_id: usuario.comunidad_id,
      numero_chasis: usuario.auto?.numero_chasis || '',
      marca: usuario.auto?.marca || '',
      modelo: usuario.auto?.modelo || '',
      imagen: usuario.imagen || ''
    };

    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    
    this.usuarioForm.patchValue(formData);
  }

  actualizarUsuario(): void {
    if (this.usuarioIdEditando && this.usuarioForm.valid) {
      const datosActualizados = this.prepararDatosUsuario();
      
      this.serviciosService.actualizarUsuario(this.usuarioIdEditando, datosActualizados).subscribe({
        next: (usuarioActualizado: Usuario) => {
          // Actualizar el usuario en ambos arrays
          const usuarioConQR = {
            ...usuarioActualizado,
            qrData: this.generateQRData(usuarioActualizado)
          };
  
          this.usuarios = this.usuarios.map(usuario => 
            usuario.id === this.usuarioIdEditando ? usuarioConQR : usuario
          );
  
          this.usuariosFiltrados = this.searchTerm ? 
            this.usuarios.filter(usuario => 
              usuario.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase())
            ) : [...this.usuarios];
  
          alert('Usuario actualizado correctamente');
          this.resetearFormulario();
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          alert('No se pudo actualizar el usuario');
        }
      });
    }
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.serviciosService.eliminarUsuario(id).subscribe({
        next: () => {
          // Eliminar el usuario de ambos arrays
          this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
          this.usuariosFiltrados = this.searchTerm ? 
            this.usuariosFiltrados.filter(usuario => usuario.id !== id) :
            [...this.usuarios];
  
          alert('Usuario eliminado correctamente');
          
          // Actualizar la paginación si es necesario
          const totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
          if (this.paginaActual > totalPaginas) {
            this.paginaActual = Math.max(1, totalPaginas);
          }
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('No se pudo eliminar el usuario');
        }
      });
    }
  }

  // Helper methods
  private prepararDatosUsuario(): any {
    const formValue = this.usuarioForm.value;
    return {
      ...formValue,
      auto: {
        numero_chasis: formValue.numero_chasis,
        marca: formValue.marca,
        modelo: formValue.modelo
      }
    };
  }

  private manejarCreacionExitosa(response: Usuario): void {
    const nuevoUsuario = {
      ...response,
      qrData: this.generateQRData(response)
    };
    
    // Actualizar ambos arrays
    this.usuarios = [...this.usuarios, nuevoUsuario];
    this.usuariosFiltrados = this.searchTerm ? 
      this.usuariosFiltrados.filter(usuario => 
        usuario.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      ) : [...this.usuarios];
  
    alert('Usuario creado correctamente');
    this.resetearFormulario();
    
    // Actualizar la paginación si es necesario
    const totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
    if (this.paginaActual > totalPaginas) {
      this.paginaActual = totalPaginas;
    }
  }

  private resetearFormulario(): void {
    this.mostrarModal = false;
    this.editando = false;
    this.usuarioIdEditando = null;
    this.pasoActual = 1; // Nuevo: Reset paso
    this.usuarioForm.reset();
    this.usuarioForm.get('password')?.setValidators([Validators.required]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
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

  // UI methods
  buscarUsuarios(event: any): void {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.searchTerm = searchTerm;
    
    this.usuariosFiltrados = !searchTerm ? [...this.usuarios] : 
      this.usuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(searchTerm) ||
        usuario.email.toLowerCase().includes(searchTerm) ||
        (usuario.telefono && usuario.telefono.toLowerCase().includes(searchTerm)) ||
        (usuario.marca && usuario.marca.toLowerCase().includes(searchTerm)) ||
        (usuario.modelo && usuario.modelo.toLowerCase().includes(searchTerm)) ||
        this.getComunidadNombre(usuario.comunidad_id).toLowerCase().includes(searchTerm)
      );
    
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.paginas.length) {
      this.paginaActual = pagina;
    }
  }

  verUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarModal = true;
  }

  cerrarModalUsuario(): void {
    this.usuarioSeleccionado = null;
    this.mostrarModal = false;
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.editando = false;
    this.pasoActual = 1; // Nuevo: Reset paso al abrir modal
    this.inicializarFormulario();
  }

  cerrarModal(): void {
    this.resetearFormulario();
  }

  private generarEmail(nombre: string): string {
    return `${nombre.replace(/\s+/g, '').toLowerCase()}@gmail.com`;
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