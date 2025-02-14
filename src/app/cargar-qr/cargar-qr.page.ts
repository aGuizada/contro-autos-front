// cargar-qr.page.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-cargar-qr',
  templateUrl: './cargar-qr.page.html',
  styleUrls: ['./cargar-qr.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ZXingScannerModule
  ]
})
export class CargarQrPage implements OnInit {
  @ViewChild('scanner') scanner!: any;

  allowedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128];
  scannerEnabled = true;
  torchEnabled = false;
  information: string = '';
  hasDevices: boolean = false;
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined = undefined;

  videoConstraints: MediaTrackConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: 'environment',
    advanced: [{
      // Eliminamos el zoom ya que no es una propiedad estándar
    }],
    aspectRatio: 1.777778
  };

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.setupDevices();
  }

  async setupDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(device => device.kind === 'videoinput');
      this.hasDevices = this.availableDevices.length > 0;

      if (this.hasDevices) {
        this.currentDevice = this.availableDevices.find(device => 
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('trasera')
        ) || this.availableDevices[0];
      }
    } catch (error) {
      console.error('Error accessing devices:', error);
    }
  }

 

  toggleTorch() {
    this.torchEnabled = !this.torchEnabled;
  }

  switchCamera() {
    if (!this.currentDevice || this.availableDevices.length <= 1) return;
    
    const currentIndex = this.availableDevices.indexOf(this.currentDevice);
    const nextIndex = (currentIndex + 1) % this.availableDevices.length;
    this.currentDevice = this.availableDevices[nextIndex];
  }

  scanErrorHandler(error: any) {
    console.error('Error al escanear:', error);
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = devices.length > 0;
  }

  // Método auxiliar para verificar si hay múltiples cámaras
  hasMultipleCameras(): boolean {
    return this.availableDevices.length > 1;
  }
  formatInformation(info: string): string {
    // Intenta parsear como JSON para datos estructurados
    try {
      const parsed = JSON.parse(info);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Si no es JSON, procesa el texto normal
      // Divide por diferentes tipos de separadores comunes
      return info.split(/[;,\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .join('\n');
    }
  }

  closeModal() {
    this.information = '';
    this.scannerEnabled = true;
  }

  scanSuccessHandler(resultString: string) {
    this.information = resultString;
    this.scannerEnabled = false; // Pausa el scanner mientras se muestra el modal
    
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    const audio = new Audio('assets/beep.mp3');
    audio.play();
  }
  
}