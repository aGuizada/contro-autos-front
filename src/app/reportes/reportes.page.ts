import { Component, OnInit } from '@angular/core';
import { ServiciosService } from 'src/app/services/servicios.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportesPage implements OnInit {

  registrosCarga: any[] = [];
  registrosPaginados: any[] = [];
  registrosFiltrados: any[] = []; // Añadido para los registros filtrados para la exportación
  loading: boolean = true;
  error: string | null = null;
  esAdmin: boolean = false;
  modalExportarVisible: boolean = false;

  // Variables de paginación
  currentPage: number = 1;
  pageSize: number = 5;

  // Variables para el filtro por fecha
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private serviciosService: ServiciosService ,  private file: File,
    private fileOpener: FileOpener,
    private platform: Platform) {}

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
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Filtrar por fecha
  filtrarPorFecha() {
    const fechaInicio = new Date(this.fechaInicio);
    const fechaFin = new Date(this.fechaFin);

    // Filtrar los registros dentro del rango de fechas
    this.registrosPaginados = this.registrosCarga.filter((registro: any) => {
      const fechaCarga = new Date(registro.fecha_carga);
      return fechaCarga >= fechaInicio && fechaCarga <= fechaFin;
    });

    // Al filtrar por fecha, también actualizamos los registros que se van a exportar
    this.registrosFiltrados = this.registrosCarga.filter((registro: any) => {
      const fechaCarga = new Date(registro.fecha_carga);
      return fechaCarga >= fechaInicio && fechaCarga <= fechaFin;
    });
  }

  // Abrir el modal de exportación
  abrirModalExportar() {
    this.modalExportarVisible = true;
  }

  // Cerrar el modal de exportación
  cerrarModalExportar() {
    this.modalExportarVisible = false;
  }

// Modified exportarRegistros method
exportarRegistros() {
  if (this.registrosFiltrados.length === 0) {
    alert("No hay registros para exportar en este rango de fechas.");
    return;
  }

  // Crear documento PDF
  const doc = new jsPDF();

  // Agregar título y fechas
  doc.setFontSize(18);
  doc.text("Reporte de Cargas Filtradas", 14, 15);
  doc.setFontSize(12);
  doc.text(`Desde: ${this.fechaInicio}  Hasta: ${this.fechaFin}`, 14, 25);

  // Agregar tabla
  const datosTabla = this.registrosFiltrados.map(registro => [
    registro.usuario?.nombre || 'Usuario', 
    registro.fecha_carga,
    registro.qrHabilitado ? "Activo" : "Deshabilitado"
  ]);

  autoTable(doc, {
    head: [['Usuario', 'Fecha de Carga', 'Estado QR']],
    body: datosTabla,
    startY: 30
  });

  // Definir el nombre del archivo
  const fileName = `Cargas_Filtradas_${this.fechaInicio}_${this.fechaFin}.pdf`;

  if (this.platform.is('cordova')) {
    // Para dispositivos móviles con Cordova
    this.guardarPDFEnDispositivo(doc, fileName);
  } else {
    // Para navegador web
    doc.save(fileName);
  }
}

// Método mejorado para guardar PDF en dispositivos móviles
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
    console.log('Archivo guardado con éxito');

    // Abrir el archivo
    await this.fileOpener.open(directory + fileName, 'application/pdf');
    console.log('Archivo abierto con éxito');

    // Cerrar el modal después de exportar con éxito
    this.cerrarModalExportar();
  } catch (error) {
    console.error('Error completo al guardar/abrir PDF:', error);
    alert('Error al guardar o abrir el PDF: ' + JSON.stringify(error));
  }
}
  
  
}
