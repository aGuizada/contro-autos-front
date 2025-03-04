import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ServiciosService } from 'src/app/services/servicios.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';        // Importación predeterminada de jsPDF
import 'jspdf-autotable'; 
import { Platform } from '@ionic/angular';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import 'jspdf-autotable';
import { autoTable } from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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
    private serviciosService: ServiciosService,  private platform: Platform,
    private file: File,
    private fileOpener: FileOpener
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
  exportarAExcel(): void {
    if (this.usuariosFiltrados.length === 0) {
      alert("No hay usuarios para exportar.");
      return;
    }
  
    // Crear la hoja de cálculo
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.usuariosFiltrados.map(usuario => ({
      'Nombre': usuario.nombre,
      'Email': usuario.email,
      'Teléfono': usuario.telefono || 'N/A',
      'Comunidad': this.getComunidadNombre(usuario.comunidad_id),
      'Rol': this.getRolNombre(usuario.rol_id),
      'Marca': usuario.auto?.marca || 'N/A',
      'Modelo': usuario.auto?.modelo || 'N/A',
      'Número de Chasis': usuario.auto?.numero_chasis || 'N/A'
    })));
  
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Usuarios': worksheet },
      SheetNames: ['Usuarios']
    };
  
    // Definir el nombre del archivo
    const fileName = `Usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`;
  
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      // Para dispositivos móviles 
      this.guardarExcelEnDispositivo(workbook, fileName);
    } else {
      // Para navegador web
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url: string = window.URL.createObjectURL(data);
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
  
  // Para exportar a PDF
  exportarAPDF(): void {
    if (this.usuariosFiltrados.length === 0) {
      alert("No hay usuarios para exportar.");
      return;
    }
  
    // Crear documento PDF
    const doc = new jsPDF();
  
    // Agregar título
    doc.setFontSize(18);
    doc.text("Lista de Usuarios", 14, 15);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 25);
  
    // Preparar datos para la tabla
    const datosTabla = this.usuariosFiltrados.map(usuario => [
      usuario.nombre,
      usuario.email,
      usuario.telefono || 'N/A',
      this.getComunidadNombre(usuario.comunidad_id)
    ]);
  
    // Agregar tabla
    autoTable(doc, {
      head: [['Nombre', 'Email', 'Teléfono', 'Comunidad']],
      body: datosTabla,
      startY: 30
    });
  
    // Definir el nombre del archivo
    const fileName = `Usuarios_${new Date().toISOString().slice(0, 10)}.pdf`;
  
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      // Para dispositivos móviles
      this.guardarPDFEnDispositivo(doc, fileName);
    } else {
      // Para navegador web
      doc.save(fileName);
    }
  }
  
  // Método para guardar Excel en dispositivos móviles
  async guardarExcelEnDispositivo(workbook: XLSX.WorkBook, fileName: string) {
    try {
      // Obtener el directorio adecuado según la plataforma
      let directory = this.file.externalDataDirectory;
      
      if (this.platform.is('ios')) {
        directory = this.file.documentsDirectory; // Usar documentsDirectory en iOS
      }
      
      if (!directory) {
        console.error('No se pudo obtener un directorio válido para guardar');
        alert('Error: No se pudo acceder al almacenamiento del dispositivo');
        return;
      }
      
      // Convertir Excel a ArrayBuffer
      const excelOutput = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Verificar que el directorio existe o crearlo
      try {
        await this.file.checkDir(directory, '');
      } catch (err) {
        console.log('El directorio no existe, intentando crear:', err);
        try {
          await this.file.createDir(directory, '', false);
        } catch (createErr) {
          console.error('Error al crear el directorio:', createErr);
          alert('No se pudo crear el directorio para guardar el archivo.');
          return;
        }
      }
      
      // Guardar el archivo
      await this.file.writeFile(directory, fileName, new Blob([excelOutput], 
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 
        { replace: true });
      console.log('Archivo Excel guardado con éxito');
      
      // Abrir el archivo
      await this.fileOpener.open(
        directory + fileName, 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      console.log('Archivo Excel abierto con éxito');
      
    } catch (error) {
      console.error('Error completo al guardar/abrir Excel:', error);
      alert('Error al guardar o abrir el Excel: ' + JSON.stringify(error));
    }
  }
  
  // Método para guardar PDF en dispositivos móviles
  async guardarPDFEnDispositivo(doc: jsPDF, fileName: string) {
    try {
      // Obtener el directorio adecuado según la plataforma
      let directory = this.file.externalDataDirectory;
      
      if (this.platform.is('ios')) {
        directory = this.file.documentsDirectory; // Usar documentsDirectory en iOS
      }
      
      if (!directory) {
        console.error('No se pudo obtener un directorio válido para guardar');
        alert('Error: No se pudo acceder al almacenamiento del dispositivo');
        return;
      }
      
      // Convertir PDF a blob
      const pdfOutput = doc.output('arraybuffer');
      
      // Verificar que el directorio existe o crearlo
      try {
        await this.file.checkDir(directory, '');
      } catch (err) {
        console.log('El directorio no existe, intentando crear:', err);
        try {
          await this.file.createDir(directory, '', false);
        } catch (createErr) {
          console.error('Error al crear el directorio:', createErr);
          alert('No se pudo crear el directorio para guardar el archivo.');
          return;
        }
      }
      
      // Guardar el archivo
      await this.file.writeFile(directory, fileName, pdfOutput, { replace: true });
      console.log('Archivo PDF guardado con éxito');
      
      // Abrir el archivo
      await this.fileOpener.open(directory + fileName, 'application/pdf');
      console.log('Archivo PDF abierto con éxito');
      
    } catch (error) {
      console.error('Error completo al guardar/abrir PDF:', error);
      alert('Error al guardar o abrir el PDF: ' + JSON.stringify(error));
    }
  }
  
}