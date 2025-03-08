import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { NetworkService } from './network.service';
@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  private apiUrl = 'https://autos.tooboxtrade.com/api';  // URL de tu API de Laravel
  // private apiUrl = '  http://127.0.0.1:8000/api';
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private networkService: NetworkService 
  ) {
    // Verificar token automáticamente al iniciar el servicio
    this.autoVerificarToken();
  }
  private saveToLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  // Método para obtener datos locales
  private getFromLocalStorage(key: string): any {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  // Método para verificar automáticamente el token al iniciar la app
  private autoVerificarToken() {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar si el token es válido
      this.getUserRole().pipe(
        catchError(error => {
          if (error.status === 401) {
            // Token inválido o expirado, limpiar storage y redirigir a login
            this.logout();
          }
          return throwError(() => error);
        })
      ).subscribe();
    }
  }

  // Headers con autorización para peticiones
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUsuarioAutenticado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`, {
      headers: this.getAuthHeaders()
    });
  }
  
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-profile`, {
      headers: this.getAuthHeaders()
    });
  }

  // Método para actualizar el perfil del usuario
  actualizarPerfil(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user-profile`, usuario, {
      headers: this.getAuthHeaders()
    });
  }
  
  // Login mejorado con persistencia de sesión
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          // Guardar token en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('emailUsuario', credentials.email);
          
          // Intentar extraer fecha de expiración del token
          try {
            const tokenData = JSON.parse(atob(response.token.split('.')[1]));
            if (tokenData.exp) {
              // Configurar timer de expiración si existe "exp" en el token
              const expiresIn = tokenData.exp * 1000 - Date.now();
              this.setLogoutTimer(expiresIn);
            }
          } catch (err) {
            console.error('Error al decodificar token:', err);
          }
        }
      })
    );
  }

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('emailUsuario');
    localStorage.removeItem('userRole');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
    this.router.navigate(['/login']);
  }

  // Configurar temporizador para cierre de sesión automático si expira el token
  private setLogoutTimer(expirationDuration: number) {
    if (expirationDuration <= 0) {
      this.logout();
      return;
    }
    
    console.log(`Token expirará en ${Math.floor(expirationDuration/1000/60)} minutos`);
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/role`, {
      headers: this.getAuthHeaders()
    });
  }
  
  // Rutas para usuarios
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`, {
      headers: this.getAuthHeaders()
    });
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Rutas para roles
  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`, {
      headers: this.getAuthHeaders()
    });
  }

  getRol(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  crearRol(rol: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles`, rol, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarRol(id: number, rol: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/${id}`, rol, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarRol(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Rutas para comunidades
  getComunidades(): Observable<any> {
    return this.http.get(`${this.apiUrl}/comunidades`, {
      headers: this.getAuthHeaders()
    });
  }

  getComunidad(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/comunidades/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  crearComunidad(comunidad: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/comunidades`, comunidad, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarComunidad(id: number, comunidad: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/comunidades/${id}`, comunidad, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarComunidad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comunidades/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Rutas para registros de carga
  getRegistrosCarga(): Observable<any> {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return throwError(() => new Error('No se encontró token de autenticación'));
    }

    return this.http.get(`${this.apiUrl}/registros-carga`, {
        headers: this.getAuthHeaders()
    }).pipe(
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
    return this.http.get(`${this.apiUrl}/registros-carga/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  crearRegistroCarga(registro: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registros-carga`, registro, {
      headers: this.getAuthHeaders()
    });
  }
  
  actualizarRegistroCarga(id: number, registro: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/registros-carga/${id}`, registro, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarRegistroCarga(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/registros-carga/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
  
  marcarQRComoEscaneado(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/registros-carga/${id}/marcar-qr`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  saveQRScan(usuarioId: number): Observable<any> {
    // Si no hay conexión, guardar localmente
    if (!this.networkService.isOnline()) {
      // Guardar la solicitud pendiente
      const pendingScans = this.getFromLocalStorage('pending_qr_scans') || [];
      const currentDate = new Date();
      const reactivationDate = new Date();
      reactivationDate.setDate(reactivationDate.getDate() + 7);
      
      pendingScans.push({
        usuario_id: usuarioId,
        fecha_carga: currentDate.toISOString(),
        qrHabilitado: false,
        fecha_reactivacion: reactivationDate.toISOString(),
        pendingSince: currentDate.getTime()
      });
      
      this.saveToLocalStorage('pending_qr_scans', pendingScans);
      
      // Simular una respuesta exitosa
      return of({
        success: true,
        message: 'QR guardado en modo offline',
        qrHabilitado: false,
        fecha_reactivacion: reactivationDate.toISOString()
      });
    }
    
    // Si hay conexión, proceder normalmente
    const fechaActual = new Date();
    const fechaReactivacion = new Date();
    fechaReactivacion.setDate(fechaReactivacion.getDate() + 7);
    
    const formattedDate = fechaActual.toISOString().slice(0, 19).replace('T', ' ');
    const formattedReactivacion = fechaReactivacion.toISOString().slice(0, 19).replace('T', ' ');
  
    return this.http.post(`${this.apiUrl}/registros-carga`, {
      usuario_id: usuarioId,
      fecha_carga: formattedDate,
      qrHabilitado: false,
      fecha_reactivacion: formattedReactivacion
    }, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  }
  
  // Método para sincronizar escaneos pendientes
 
  
  checkQRStatus(usuarioId: number): Observable<any> {
    // Añadir un timestamp para evitar caché del navegador
    const timestamp = new Date().getTime();
    return this.http.get(`${this.apiUrl}/registros-carga/check-qr-status/${usuarioId}?t=${timestamp}`, {
      headers: this.getAuthHeaders()
    });
  }
  
  getQRNextActivationDate(usuarioId: number): Observable<any> {
    // Añadir un timestamp para evitar caché del navegador
    const timestamp = new Date().getTime();
    return this.http.get(`${this.apiUrl}/registros-carga/next-activation/${usuarioId}?t=${timestamp}`, {
      headers: this.getAuthHeaders()
    });
  }
  public syncPendingScans(): void {
    if (!this.networkService.isOnline()) return;
    
    const pendingScans = this.getFromLocalStorage('pending_qr_scans') || [];
    if (pendingScans.length === 0) return;
    
    // Procesar cada escaneo pendiente
    const updatedPendingScans = [...pendingScans];
    let pendingCount = pendingScans.length;
    
    pendingScans.forEach((scan: any, index: number) => {
      this.http.post(`${this.apiUrl}/registros-carga`, {
        usuario_id: scan.usuario_id,
        fecha_carga: scan.fecha_carga,
        qrHabilitado: scan.qrHabilitado,
        fecha_reactivacion: scan.fecha_reactivacion
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).subscribe({
        next: () => {
          // Remover de la lista de pendientes
          updatedPendingScans.splice(updatedPendingScans.findIndex(s => 
            s.usuario_id === scan.usuario_id && 
            s.pendingSince === scan.pendingSince), 1);
          
          pendingCount--;
          if (pendingCount === 0) {
            this.saveToLocalStorage('pending_qr_scans', updatedPendingScans);
          }
        },
        error: () => {
          pendingCount--;
          if (pendingCount === 0) {
            this.saveToLocalStorage('pending_qr_scans', updatedPendingScans);
          }
        }
      });
    });
  }
}
