import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServiciosService } from './servicios.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: ServiciosService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/login']);
      return of(false);
    }

    // Verificar si el token es válido haciendo una petición al backend
    return this.authService.getUserRole().pipe(
      map(response => {
        // Si obtenemos una respuesta válida, el token funciona
        return true;
      }),
      catchError(error => {
        console.error('Error en validación de token:', error);
        // Si el token es inválido o expirado, redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('emailUsuario');
        localStorage.removeItem('userRole');
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}