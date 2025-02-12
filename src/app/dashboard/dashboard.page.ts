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
  chart: any;

  constructor(private userService: ServiciosService) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  obtenerUsuarios() {
    this.userService.getUsuarios().subscribe(
      (usuarios) => {
        this.usuarios = usuarios;
        this.totalUsuarios = usuarios.length;
        this.contarUsuariosPorComunidad(usuarios);
        this.calcularPorcentajes();
        this.updateChart();
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

  getComunidadKeys() {
    return Object.keys(this.usuariosPorComunidad);
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

  updateChart() {
    if (this.chart) {
      const labels = this.getComunidadKeys();
      const data = labels.map(key => this.usuariosPorComunidad[key]);
      
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }
}