import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';
import { IonicModule } from '@ionic/angular';  // Asegúrate de importar IonicModule
import { CommonModule } from '@angular/common';  // Importa CommonModule para usar *ngFor

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,  // Marca el componente como standalone
  imports: [IonicModule, CommonModule]  // Incluye IonicModule y CommonModule aquí
})
export class DashboardPage implements OnInit {
  totalUsuarios: number = 0;
  usuariosPorComunidad: { [comunidad: string]: number } = {}; // Para almacenar la cantidad de usuarios por comunidad
  usuarios: any[] = []; // Lista de usuarios
  porcentajesPorComunidad: { [comunidad: string]: number } = {};  // Para almacenar los porcentajes

  constructor(private userService: ServiciosService) { }

  ngOnInit() {
    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    this.userService.getUsuarios().subscribe(
      (usuarios) => {
        this.usuarios = usuarios;
        this.totalUsuarios = usuarios.length;
        this.contarUsuariosPorComunidad(usuarios);
        this.calcularPorcentajes();  // Calcular porcentajes después de obtener los usuarios
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  }

  contarUsuariosPorComunidad(usuarios: any[]) {
    this.usuariosPorComunidad = {};  // Limpiar el objeto antes de contar
    usuarios.forEach(usuario => {
      const comunidad = usuario.comunidad?.nombre || 'Sin Comunidad';  // Acceder al nombre de la comunidad
      this.usuariosPorComunidad[comunidad] = (this.usuariosPorComunidad[comunidad] || 0) + 1;
    });
  }

  calcularPorcentajes() {
    for (const comunidad in this.usuariosPorComunidad) {
      const cantidad = this.usuariosPorComunidad[comunidad];
      const porcentaje = (cantidad / this.totalUsuarios) * 100;
      this.porcentajesPorComunidad[comunidad] = porcentaje;
    }
  }

  // Obtener las claves de las comunidades para iterar en el HTML
  getComunidadKeys() {
    return Object.keys(this.usuariosPorComunidad);
  }
}
