import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  private apiUrl = 'http://localhost:8000/api';  // URL de tu API de Laravel (ajusta el puerto y dominio si es necesario)

  constructor(private http: HttpClient) { }

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

  // Rutas para autos
  getAutos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/autos`);
  }

  getAuto(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/autos/${id}`);
  }

  crearAuto(auto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/autos`, auto);
  }

  actualizarAuto(id: number, auto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/autos/${id}`, auto);
  }

  eliminarAuto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/autos/${id}`);
  }

  // Rutas para registros de carga
  getRegistrosCarga(): Observable<any> {
    return this.http.get(`${this.apiUrl}/registros-carga`);
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
}
