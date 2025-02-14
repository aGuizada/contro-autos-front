import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardPage implements OnInit, AfterViewInit {
  totalUsuarios: number = 0;
  usuariosPorComunidad: { [comunidad: string]: number } = {};
  usuarios: any[] = [];
  porcentajesPorComunidad: { [comunidad: string]: number } = {};
  comunidadesMasActivas: { nombre: string; usuarios: number; porcentaje: number }[] = [];
  usuariosMasActivos: { nombre: string; comunidad: string; cargas: number }[] = [];
  chart: any;
  activityChart: any;

  constructor(private userService: ServiciosService) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  ngAfterViewInit() {
    this.initChart();
    this.initActivityChart();
  }

  obtenerUsuarios() {
    this.userService.getUsuarios().subscribe(
      (usuarios) => {
        this.usuarios = usuarios;
        this.totalUsuarios = usuarios.length;
        this.contarUsuariosPorComunidad(usuarios);
        this.calcularPorcentajes();
        this.ordenarComunidadesPorActividad();
        this.identificarUsuariosMasActivos(usuarios);
        this.updateCharts();
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  }

  contarUsuariosPorComunidad(usuarios: any[]) {
    this.usuariosPorComunidad = {};
    usuarios.forEach(usuario => {
      const comunidad = usuario.comunidad?.nombre || 'Sin Comunidad';
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

  ordenarComunidadesPorActividad() {
    this.comunidadesMasActivas = Object.entries(this.usuariosPorComunidad)
      .map(([nombre, usuarios]) => ({
        nombre,
        usuarios,
        porcentaje: this.porcentajesPorComunidad[nombre]
      }))
      .sort((a, b) => b.usuarios - a.usuarios)
      .slice(0, 5);
  }

  identificarUsuariosMasActivos(usuarios: any[]) {
    this.usuariosMasActivos = usuarios
      .map(usuario => ({
        nombre: usuario.nombre,
        comunidad: usuario.comunidad?.nombre || 'Sin Comunidad',
        cargas: usuario.cargas || 0
      }))
      .sort((a, b) => b.cargas - a.cargas)
      .slice(0, 5);
  }

  getComunidadKeys() {
    return Object.keys(this.usuariosPorComunidad)
      .sort((a, b) => this.usuariosPorComunidad[b] - this.usuariosPorComunidad[a]);
  }

  initChart() {
    const ctx = document.getElementById('communityChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Usuarios por Comunidad',
          data: [],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  initActivityChart() {
    const ctx = document.getElementById('activityChart') as HTMLCanvasElement;
    this.activityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Actividad por Usuario',
          data: [],
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateCharts() {
    if (this.chart) {
      const labels = this.getComunidadKeys();
      const data = labels.map(key => this.usuariosPorComunidad[key]);
      
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }

    if (this.activityChart) {
      const labels = this.usuariosMasActivos.map(u => u.nombre);
      const data = this.usuariosMasActivos.map(u => u.cargas);
      
      this.activityChart.data.labels = labels;
      this.activityChart.data.datasets[0].data = data;
      this.activityChart.update();
    }
  }
}