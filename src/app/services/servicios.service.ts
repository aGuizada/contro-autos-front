import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs'; // Importa throwError
import { catchError } from 'rxjs/operators'; // Importa catchError

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  private apiUrl = 'https://autos.tooboxtrade.com/api';  // URL de tu API de Laravel (ajusta el puerto y dominio si es necesario)

  constructor(  private http: HttpClient,
    private router: Router) { }



  getUsuarioAutenticado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-profile`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  }

  // Método para actualizar el perfil del usuario
  actualizarPerfil(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user-profile`, usuario, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  }
  
  
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getUserRole(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/role`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  }
  
  
  
  // Rutas para usuarios
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${id}`);
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario);
  }

  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  // Rutas para roles
  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }

  getRol(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles/${id}`);
  }

  crearRol(rol: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles`, rol);
  }

  actualizarRol(id: number, rol: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/${id}`, rol);
  }

  eliminarRol(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${id}`);
  }

  // Rutas para comunidades
  getComunidades(): Observable<any> {
    return this.http.get(`${this.apiUrl}/comunidades`);
  }

  getComunidad(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/comunidades/${id}`);
  }

  crearComunidad(comunidad: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/comunidades`, comunidad);
  }

  actualizarComunidad(id: number, comunidad: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/comunidades/${id}`, comunidad);
  }

  eliminarComunidad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comunidades/${id}`);
  }

  // Rutas para registros de carga

  

  getRegistrosCarga(): Observable<any> {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return throwError(() => new Error('No se encontró token de autenticación'));
    }

    return this.http.get(`${this.apiUrl}/registros-carga`, {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        })
    }).pipe(
        // Opcional: puedes agregar un catchError para manejar errores de autenticación
        catchError((error: any) => {
            console.error('Error al obtener registros:', error);
            
            if (error.status === 401) {
                this.router.navigate(['/login']);
            }
            
            return throwError(() => error);
        })
    );
}
  getRegistroCarga(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/registros-carga/${id}`);
  }

  crearRegistroCarga(registro: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registros-carga`, registro);
  }
  

  actualizarRegistroCarga(id: number, registro: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/registros-carga/${id}`, registro);
  }

  eliminarRegistroCarga(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/registros-carga/${id}`);
  }
  marcarQRComoEscaneado(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/registros-carga/${id}/marcar-qr`, {});
  }
  saveQRScan(usuarioId: number): Observable<any> {
    // Use toLocaleString() or a specific date formatting method
    const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
    return this.http.post(`${this.apiUrl}/registros-carga`, {
      usuario_id: usuarioId,
      fecha_carga: formattedDate, // MySQL-compatible format
      qrHabilitado: false
    }, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  }

  // Method to check if QR is currently enabled for a user
  checkQRStatus(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/registros-carga/check-qr-status/${usuarioId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  }
  
}
