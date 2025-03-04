import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ServiciosService } from 'src/app/services/servicios.service';
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
  scanSuccessful: boolean = false; // Añadida esta propiedad
  
  videoConstraints: MediaTrackConstraints = {
    width: { ideal: 1280 }, // Reducido para mejor rendimiento
    height: { ideal: 720 },
    facingMode: 'environment',
    advanced: [{
      // Usamos un cast para evitar errores de TypeScript con propiedades no estándar
      ...(({ zoom: 2.0 }) as any)
    }],
    aspectRatio: 1.777778
  };
  
  constructor(private serviciosService: ServiciosService ) {}
  
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
    this.scanSuccessful = false; // Resetear esta propiedad al cerrar el modal
    this.scannerEnabled = true;
  }
  
  scanSuccessHandler(resultString: string) {
    this.information = resultString;
    this.scannerEnabled = false; // Pausa el scanner mientras se muestra el modal
    
    // Obtener el ID de usuario del QR escaneado
    this.procesarQREscaneado(resultString);
    
    // Vibración
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    // Sonido de beep
    const audio = new Audio('assets/beep.mp3');
    audio.play();
    
    // Espera a que termine el beep para reproducir el mensaje de voz
    audio.onended = () => {
      // Mensaje de voz "Registrado correctamente"
      const speech = new SpeechSynthesisUtterance('Registrado correctamente');
      speech.lang = 'es-ES';
      speech.volume = 1;
      speech.rate = 1;
      window.speechSynthesis.speak(speech);
    };
  }
  
  procesarQREscaneado(qrData: string) {
    // Intentar extraer el ID de usuario del contenido del QR
    // Asumimos que el QR tiene un formato como: "Nombre: Juan\nEmail: juan@example.com\n..."
    const lines = qrData.split('\n');
    let usuarioEmail = null;
    
    // Buscar la línea que contiene el email
    for (const line of lines) {
      if (line.toLowerCase().includes('email:')) {
        usuarioEmail = line.split(':')[1]?.trim();
        break;
      }
    }
    
    if (usuarioEmail) {
      // Buscar el usuario por email en el sistema
      this.buscarUsuarioPorEmailYDesactivarQR(usuarioEmail);
    }
  }
  
  buscarUsuarioPorEmailYDesactivarQR(email: string) {
    // Obtener la lista de usuarios para encontrar el ID correspondiente al email
    this.serviciosService.getUsuarios().subscribe(
      (usuarios: any[]) => {
        const usuario = usuarios.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (usuario && usuario.id) {
          console.log('Usuario encontrado:', usuario);
          
          // Desactivar el QR del usuario encontrado
          this.serviciosService.saveQRScan(usuario.id).subscribe(
            (response) => {
              console.log('QR desactivado correctamente:', response);
              this.scanSuccessful = true; // Marcar como exitoso para mostrar el indicador
            },
            (error) => {
              console.error('Error al desactivar QR:', error);
              // Aquí puedes mostrar un mensaje de error
            }
          );
        } else {
          console.error('No se encontró usuario con email:', email);
        }
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  }
  
  extractUsuarioId(qrData: string): number | null {
    // Implementación básica para extraer ID
    // Esto debe adaptarse según tu formato de QR
    try {
      // Buscar líneas que contengan información del usuario
      const lines = qrData.split('\n');
      // Buscar un patrón que indique el ID del usuario
      // Por ejemplo, si el email está en el QR podemos buscar al usuario por email
      
      const emailLine = lines.find(line => line.toLowerCase().includes('email:'));
      if (emailLine) {
        const email = emailLine.split(':')[1].trim();
        // Aquí deberíamos hacer una llamada al API para obtener el ID por email
        // Por ahora, retornamos null como placeholder
      }
      
      // Si no encontramos método para extraer ID, retornamos null
      return null;
    } catch (error) {
      console.error('Error al extraer ID de usuario del QR', error);
      return null;
    }
  }
  
  verificarYProcesarQR(usuarioId: number, resultString: string) {
    // Verificar si el QR está habilitado
    this.verificarQRHabilitado(usuarioId).then(habilitado => {
      if (habilitado) {
        // QR válido, procesarlo
        this.procesarQRValido(usuarioId, resultString);
      } else {
        // QR deshabilitado, mostrar mensaje
        this.mostrarResultadoEscaneo(resultString, false, 'QR deshabilitado. Por favor, espere 7 días para volver a usarlo.');
      }
    }).catch(error => {
      console.error('Error al verificar QR', error);
      this.mostrarResultadoEscaneo(resultString, false, 'Error al verificar el QR');
    });
  }
  
  verificarQRHabilitado(usuarioId: number): Promise<boolean> {
    // Implementación para API real
    // return this.serviciosService.checkQRStatus(usuarioId).toPromise()
    //   .then(response => response.qrHabilitado)
    //   .catch(error => {
    //     console.error('Error al verificar QR', error);
    //     return false;
    //   });
      
    // Implementación provisional
    return Promise.resolve(true);
  }
  
  procesarQRValido(usuarioId: number, resultString: string) {
    // Marcar como escaneado en la base de datos
    // this.serviciosService.saveQRScan(usuarioId).subscribe(...
    
    // Por ahora, solo mostrar el resultado
    this.mostrarResultadoEscaneo(resultString, true);
  }
  
  mostrarResultadoEscaneo(resultString: string, exito: boolean, mensajePersonalizado?: string) {
    // Vibración
    if (navigator.vibrate) {
      navigator.vibrate(exito ? 200 : [100, 50, 100]);
    }
    
    // Sonido de beep
    const audio = new Audio('assets/beep.mp3');
    audio.play();
    
    // Espera a que termine el beep para reproducir el mensaje de voz
    audio.onended = () => {
      // Mensaje de voz
      const mensaje = mensajePersonalizado || (exito ? 'Registrado correctamente' : 'QR no válido');
      const speech = new SpeechSynthesisUtterance(mensaje);
      speech.lang = 'es-ES';
      speech.volume = 1;
      speech.rate = 1;
      window.speechSynthesis.speak(speech);
    };
  }
}