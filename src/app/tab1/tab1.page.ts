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
    nombre: '',
    email: '',
    telefono: '',
    numero_chasis: '',
    marca: '',
    modelo: '',
    qrData: '',
    rol: { nombre: '' },
    comunidad: { nombre: '' },
    qrHabilitado: true  // Cambiado a true para que el QR se muestre inicialmente
  };

  loading: boolean = false;  // Variable para mostrar un mensaje de carga

  constructor(private usuarioService: ServiciosService) {}

  ngOnInit() {
    this.obtenerUsuarioAutenticado(); 
  
    const usuarioGuardado = localStorage.getItem(`usuarioQR_${this.usuarioSeleccionado.email}`);
    if (usuarioGuardado) {
      this.usuarioSeleccionado = JSON.parse(usuarioGuardado);
    }
  
    // Verificar si el QR de este usuario sigue deshabilitado
    this.verificarQRHabilitado();
  }
  

  obtenerUsuarioAutenticado() {
    this.usuarioService.getUsuarioAutenticado().subscribe(
      (data: any[]) => {
        const emailAutenticado = localStorage.getItem('emailUsuario');
        this.usuarioSeleccionado = data.find(user => user.email === emailAutenticado) || {};
  
        // Asegúrate de que el ID esté presente
        if (this.usuarioSeleccionado.id) {
          this.usuarioSeleccionado.qrData = this.generateQRData(this.usuarioSeleccionado);
          this.verificarQRHabilitado(); // Se verifica si ya fue escaneado antes
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

  // Método para marcar el QR como escaneado y actualizar la base de datos
  marcarQRComoEscaneado() {
    if (!this.usuarioSeleccionado?.email) return;
  
    // Deshabilitamos el QR solo para este usuario
    this.usuarioSeleccionado.qrHabilitado = false;
  
    // Guardamos la fecha de deshabilitación con clave única para cada usuario
    const fechaHabilitacion = this.obtenerFechaFutura(7);
    localStorage.setItem(`qrDeshabilitadoHasta_${this.usuarioSeleccionado.email}`, fechaHabilitacion);
  
    // También guardamos el usuario actualizado
    localStorage.setItem(`usuarioQR_${this.usuarioSeleccionado.email}`, JSON.stringify(this.usuarioSeleccionado));
  }
  

  verificarQRHabilitado() {
    if (!this.usuarioSeleccionado?.email) return;
  
    const fechaGuardada = localStorage.getItem(`qrDeshabilitadoHasta_${this.usuarioSeleccionado.email}`);
  
    if (fechaGuardada) {
      const hoy = new Date();
      const fechaHabilitacion = new Date(fechaGuardada);
  
      // Habilitar QR si la fecha de habilitación ya pasó
      this.usuarioSeleccionado.qrHabilitado = hoy >= fechaHabilitacion;
    } else {
      // Si no hay fecha guardada, significa que el QR nunca fue deshabilitado
      this.usuarioSeleccionado.qrHabilitado = true;
    }
  }
  

  obtenerFechaFutura(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString();
  }

  escaneoQR(dataQR: string) {
    console.log('QR escaneado:', dataQR);
  
    this.usuarioSeleccionado.qrData = dataQR;
    this.usuarioSeleccionado.qrHabilitado = true;
  
    localStorage.setItem('usuarioQR', JSON.stringify(this.usuarioSeleccionado));
  }
}
