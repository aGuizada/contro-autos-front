
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isAutoLogin: boolean = false; // Nuevo: para controlar el inicio de sesión automático
  progress: number = 0;
  progressInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: ServiciosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.checkExistingSession();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Método para verificar si hay una sesión existente
  private checkExistingSession(): void {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Mostrar pantalla de carga de inicio de sesión automático
      this.isAutoLogin = true;
      this.isLoading = true;
      this.startProgressAnimation();

      // Verificar si el token es válido
      this.authService.getUserRole().subscribe({
        next: (userInfo) => {
          if (userInfo.role) {
            localStorage.setItem('userRole', userInfo.role.toString());
            // Simular un pequeño retraso para mostrar la animación
            setTimeout(() => {
              this.redirectBasedOnRole();
            }, 1500);
          } else {
            this.handleAutoLoginError();
          }
        },
        error: (error) => {
          console.error('Error al verificar token:', error);
          this.handleAutoLoginError();
        }
      });
    }
  }

  private handleAutoLoginError(): void {
    // Si hay un error en el inicio de sesión automático
    this.isAutoLogin = false;
    this.isLoading = false;
    clearInterval(this.progressInterval);
    localStorage.removeItem('token');
    localStorage.removeItem('emailUsuario');
    localStorage.removeItem('userRole');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.progress = 0;
    this.startProgressAnimation();

    const loginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        if (response.token) {
          const email = this.loginForm.value.email;
          localStorage.setItem('emailUsuario', email);

          this.authService.getUserRole().subscribe({
            next: (userInfo) => {
              if (userInfo.role) {
                localStorage.setItem('userRole', userInfo.role.toString());
                this.redirectBasedOnRole();
              } else {
                this.handleLoginError('Error al obtener el rol del usuario');
              }
            },
            error: (error) => {
              this.handleLoginError('Error al obtener el rol del usuario');
            }
          });
        } else {
          this.handleLoginError('Error en la respuesta del servidor');
        }
      },
      error: (error) => {
        this.handleLoginError(error.error?.message || 'Error al iniciar sesión. Por favor, intente nuevamente.');
      }
    });
  }

  private startProgressAnimation(): void {
    // Simular el progreso de carga
    this.progressInterval = setInterval(() => {
      if (this.progress < 100) {
        this.progress += 5;
      } else {
        clearInterval(this.progressInterval);
      }
    }, 100);
  }

  private handleLoginError(errorMessage: string): void {
    this.errorMessage = errorMessage;
    this.isLoading = false;
    clearInterval(this.progressInterval);
  }

  private redirectBasedOnRole(): void {
    const role = localStorage.getItem('userRole');
    
    // Esperar a que la barra de progreso llegue al 100% antes de redirigir
    const checkProgress = setInterval(() => {
      if (this.progress >= 100) {
        clearInterval(checkProgress);
        
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'user') {
          this.router.navigate(['/tabs']);
        } else {
          this.router.navigate(['/login']);
        }
      }
    }, 100);
  }
}