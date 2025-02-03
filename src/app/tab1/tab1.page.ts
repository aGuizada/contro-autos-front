import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, QRCodeComponent]
})
export class Tab1Page implements OnInit {
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
    qrHabilitado: true
  };

  loading: boolean = false;

  constructor(private usuarioService: ServiciosService) {}

  ngOnInit() {
    this.obtenerUsuarioAutenticado();
  }

  obtenerUsuarioAutenticado() {
    this.usuarioService.getUsuarioAutenticado().subscribe(
      (data: any[]) => {
        const emailAutenticado = localStorage.getItem('emailUsuario');
        this.usuarioSeleccionado = data.find(user => user.email === emailAutenticado) || {};
  
        if (this.usuarioSeleccionado.id) {
          this.usuarioSeleccionado.qrData = this.generateQRData(this.usuarioSeleccionado);
          this.verificarQRHabilitado();
        }
      },
      (error) => {
        console.error('Error al obtener usuario', error);
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
    if (!this.usuarioSeleccionado?.id) return;

    this.loading = true;
    
    this.usuarioService.saveQRScan(this.usuarioSeleccionado.id).subscribe(
      (response) => {
        this.usuarioSeleccionado.qrHabilitado = false;
        this.loading = false;
        // Opcional: mostrar un mensaje de éxito
      },
      (error) => {
        console.error('Error al marcar QR como escaneado', error);
        this.loading = false;
        // Opcional: mostrar un mensaje de error
      }
    );
  }

  verificarQRHabilitado() {
    if (!this.usuarioSeleccionado?.id) return;

    this.usuarioService.checkQRStatus(this.usuarioSeleccionado.id).subscribe(
      (status: any) => {
        this.usuarioSeleccionado.qrHabilitado = status.qrHabilitado;
      },
      (error) => {
        console.error('Error al verificar estado del QR', error);
        // Por defecto, asumir que el QR está habilitado si hay un error
        this.usuarioSeleccionado.qrHabilitado = true;
      }
    );
  }

  escaneoQR(dataQR: string) {
    console.log('QR escaneado:', dataQR);
  
    this.usuarioSeleccionado.qrData = dataQR;
    this.usuarioSeleccionado.qrHabilitado = true;
  }
}