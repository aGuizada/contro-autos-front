import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../services/servicios.service'; // Asegúrate de que la ruta sea correcta
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PerfilPage implements OnInit {
  user: any = {};
  isLoading: boolean = true;
  usuario: any;
  constructor(private authService: ServiciosService) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  cerrarSesion(): void {
    localStorage.removeItem('token'); // Elimina el token de autenticación
    this.user = {}; // Resetea los datos del usuario
    this.usuario = null;
    console.log('Sesión cerrada con éxito');
    window.location.href = '/login'; // Redirige a la página de login
  }
  
  // Método para cargar los datos del perfil
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

  // Método para actualizar el perfil (si lo necesitas)
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

  // Método vacío para el clic en "Editar Perfil" (lo puedes rellenar más tarde)
  editProfile(): void {
    console.log('Funcionalidad de edición de perfil aún no implementada');
    // Aquí puedes abrir un formulario o alguna funcionalidad para editar los datos
  }
}
