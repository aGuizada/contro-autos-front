import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  user: any = {};
  isLoading: boolean = true;
  usuario: any;
  
  constructor(private authService: ServiciosService) {}

  ngOnInit() {
    this.loadUserProfile();
  }
  
  cerrarSesion(): void {
    // Usar el método logout del servicio
    this.authService.logout();
  }
  
  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario:', error);
        this.isLoading = false;
      }
    });
  }

  updateProfile(): void {
    this.authService.actualizarPerfil(this.user).subscribe({
      next: (data) => {
        console.log('Perfil actualizado con éxito', data);
      },
      error: (error) => {
        console.error('Error al actualizar el perfil', error);
      }
    });
  }

  editProfile(): void {
    console.log('Funcionalidad de edición de perfil aún no implementada');
  }
}