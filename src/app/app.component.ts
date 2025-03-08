
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiciosService } from './services/servicios.service';
import { NetworkService } from './services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: ServiciosService,
    private networkService: NetworkService
  ) {}

  ngOnInit() {
    // Verificar si hay un token almacenado
    const token = localStorage.getItem('token');
    
    if (token) {
      // Validar si el token es válido
      this.authService.getUserRole().subscribe({
        next: (userInfo: any) => {
          console.log('Usuario autenticado:', userInfo);
          
          // Guardar rol si está disponible y redirigir según el rol
          if (userInfo.role) {
            localStorage.setItem('userRole', userInfo.role.toString());
            
            // Sincronizar datos pendientes si hay conexión
            this.setupNetworkListener();
            
            // Redirigir según rol
            this.redirectBasedOnRole(userInfo.role);
          }
        },
        error: (error) => {
          console.error('Error al validar token:', error);
          // Si hay error, token inválido o expirado, borrar datos y redirigir a login
          localStorage.removeItem('token');
          localStorage.removeItem('emailUsuario');
          localStorage.removeItem('userRole');
          this.router.navigate(['/login']);
        }
      });
    }
  }

  private setupNetworkListener() {
    this.networkService.getNetworkStatus().subscribe(isOnline => {
      if (isOnline) {
        // Intentar sincronizar datos pendientes cuando la conexión se restablece
        this.authService.syncPendingScans();
      }
    });
  }

  private redirectBasedOnRole(role: string): void {
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'user') {
      this.router.navigate(['/tabs']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}