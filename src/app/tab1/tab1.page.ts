import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { QRCodeComponent } from 'angularx-qrcode';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, QRCodeComponent]
})
export class Tab1Page implements OnInit, OnDestroy {
  usuarioSeleccionado: any = {
    id: null,
    nombre: '',
    email: '',
    telefono: '',
    numero_chasis: '',
    marca: '',
    modelo: '',
    qrData: '',
    rol: { nombre: '' },
    comunidad: { nombre: '' },
    qrHabilitado: true,
    fechaReactivacion: null
  };
  qrEscaneado: boolean = false;  
  loading: boolean = false;
  diasRestantes: number = 0;
  updateSubscription: Subscription | null = null;

  constructor(
    private usuarioService: ServiciosService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.obtenerUsuarioAutenticado();
    // Verificar el estado del QR cada 3 segundos para actualizaciones en tiempo real
    this.startQRStatusPolling();
  }

  ngOnDestroy() {
    this.stopQRStatusPolling();
  }

  startQRStatusPolling() {
    // Cancelar cualquier suscripción existente primero
    this.stopQRStatusPolling();
    
    // Iniciar un nuevo polling cada 3 segundos
    this.updateSubscription = interval(3000).subscribe(() => {
      if (this.usuarioSeleccionado.id) {
        this.verificarQRHabilitado();
      }
    });
    console.log('Iniciado polling de estado QR');
  }

  stopQRStatusPolling() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = null;
      console.log('Detenido polling de estado QR');
    }
  }

  obtenerUsuarioAutenticado() {
    this.loading = true;
    this.usuarioService.getUsuarioAutenticado().subscribe(
      (data: any[]) => {
        const emailAutenticado = localStorage.getItem('emailUsuario');
        this.usuarioSeleccionado = data.find(user => user.email === emailAutenticado) || {};
  
        if (this.usuarioSeleccionado.id) {
          this.usuarioSeleccionado.qrData = this.generateQRData(this.usuarioSeleccionado);
          this.verificarQRHabilitado();
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener usuario', error);
        this.loading = false;
      }
    );
  }

  generateQRData(usuario: any): string {
    return `Nombre: ${usuario.nombre}
Email: ${usuario.email}
Rol: ${usuario.rol?.nombre || 'Desconocido'}
Comunidad: ${usuario.comunidad?.nombre || 'Desconocida'}
Número de Chasis: ${usuario.numero_chasis || 'N/A'}
Marca: ${usuario.marca || 'N/A'}
Modelo: ${usuario.modelo || 'N/A'}`;
  }

  // Método para marcar el QR como escaneado y guardar en la base de datos
  marcarQRComoEscaneado() {
    if (!this.usuarioSeleccionado?.id || !this.usuarioSeleccionado?.qrHabilitado) return;

    this.loading = true;
    
    this.usuarioService.saveQRScan(this.usuarioSeleccionado.id).subscribe(
      (response) => {
        // Actualizar de inmediato sin esperar al polling
        this.usuarioSeleccionado.qrHabilitado = false;
        this.loading = false;
        this.presentToast('QR desactivado correctamente. Se reactivará en 7 días.');
        // Actualizar información de próxima reactivación
        this.obtenerFechaProximaActivacion();
      },
      (error) => {
        console.error('Error al marcar QR como escaneado', error);
        this.loading = false;
        this.presentToast('Error al desactivar el QR. Intente nuevamente.');
      }
    );
  }

  verificarQRHabilitado() {
    if (!this.usuarioSeleccionado?.id) return;

    console.log('Verificando estado del QR para usuario ID:', this.usuarioSeleccionado.id);
    
    this.usuarioService.checkQRStatus(this.usuarioSeleccionado.id).subscribe(
      (status: any) => {
        console.log('Estado del QR recibido:', status);
        
        // Solo actualizar si hay un cambio de estado para evitar parpadeos en la UI
        if (this.usuarioSeleccionado.qrHabilitado !== status.qrHabilitado) {
          console.log('Cambio de estado detectado:', 
                     this.usuarioSeleccionado.qrHabilitado, '->', status.qrHabilitado);
          
          this.usuarioSeleccionado.qrHabilitado = status.qrHabilitado;
          
          // Si pasa de habilitado a deshabilitado, mostrar mensaje
          if (!status.qrHabilitado) {
            this.presentToast('El QR ha sido escaneado y desactivado');
            this.obtenerFechaProximaActivacion();
          }
          // Si pasa de deshabilitado a habilitado, mostrar mensaje
          else if (status.qrHabilitado) {
            this.presentToast('¡QR reactivado! Ya puede ser utilizado nuevamente');
          }
        }
      },
      (error) => {
        console.error('Error al verificar estado del QR', error);
      }
    );
  }

  obtenerFechaProximaActivacion() {
    if (!this.usuarioSeleccionado?.id) return;

    this.usuarioService.getQRNextActivationDate(this.usuarioSeleccionado.id).subscribe(
      (response: any) => {
        if (response && response.fechaReactivacion) {
          this.usuarioSeleccionado.fechaReactivacion = response.fechaReactivacion;
          this.calcularDiasRestantes(response.fechaReactivacion);
        }
      },
      (error) => {
        console.error('Error al obtener fecha de reactivación', error);
      }
    );
  }

  calcularDiasRestantes(fechaReactivacion: string) {
    const fechaActual = new Date();
    const fechaActivacion = new Date(fechaReactivacion);
    
    // Calcular la diferencia en milisegundos
    const diferencia = fechaActivacion.getTime() - fechaActual.getTime();
    
    // Convertir a días
    this.diasRestantes = Math.ceil(diferencia / (1000 * 3600 * 24));
    
    if (this.diasRestantes <= 0) {
      // Si ya pasó el tiempo, verificar nuevamente el estado
      this.verificarQRHabilitado();
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'primary'
    });
    toast.present();
  }

  formatFechaReactivacion(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}