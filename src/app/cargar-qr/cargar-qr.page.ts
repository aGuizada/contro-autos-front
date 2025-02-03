// cargar-qr.page.ts
import { Component, OnInit } from '@angular/core';
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
  allowedFormats = [ BarcodeFormat.QR_CODE ];
  scannerEnabled = true;
  information: string = '';
  
  constructor() { }

  ngOnInit() {
  }

  scanSuccessHandler(resultString: string) {
    this.information = resultString;
    this.scannerEnabled = false;
    console.log('Contenido del código QR:', resultString);
  }

  enableScanner() {
    this.scannerEnabled = true;
    this.information = '';
  }

  scanErrorHandler(error: any) {
    console.error('Error al escanear:', error);
  }
}