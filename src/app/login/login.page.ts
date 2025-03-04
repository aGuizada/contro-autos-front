import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Interface para la respuesta del login
interface LoginResponse {
  token: string;
  message: string;
}

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
  progress: number = 0; // Valor inicial del progreso
  progressInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: ServiciosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();

    // Verificar si el usuario ya está autenticado
    const token = localStorage.getItem('token');
    if (token && !this.isTokenExpired(token)) {
      this.redirectBasedOnRole(); // Redirigir según el rol
    }
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.progress = 0; // Reiniciar la barra de progreso

    // Simular el progreso de carga
    this.progressInterval = setInterval(() => {
      if (this.progress < 100) {
        this.progress += 5;
      } else {
        clearInterval(this.progressInterval);
      }
    }, 100);

    const loginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response: LoginResponse) => {
        this.handleLoginSuccess(response);
      },
      error: (error) => {
        this.handleLoginError(error);
      },
      complete: () => {
        setTimeout(() => {
          this.isLoading = false;
          clearInterval(this.progressInterval);
        }, 1000);
      }
    });
  }

  private handleLoginSuccess(response: LoginResponse): void {
    if (response.token) {
      localStorage.setItem('token', response.token);
      const email = this.loginForm.value.email;
      localStorage.setItem('emailUsuario', email);

      this.authService.getUserRole().subscribe({
        next: (userInfo: any) => {
          if (userInfo.role) {
            localStorage.setItem('userRole', userInfo.role.toString());
            this.redirectBasedOnRole();
          } else {
            this.errorMessage = 'Error al obtener el rol del usuario';
          }
        },
        error: () => {
          this.errorMessage = 'Error al obtener el rol del usuario';
        }
      });
    } else {
      this.errorMessage = 'Error en la respuesta del servidor';
    }
  }

  private handleLoginError(error: any): void {
    this.errorMessage = error.error?.message || 'Error al iniciar sesión. Por favor, intente nuevamente.';
    this.isLoading = false;
    clearInterval(this.progressInterval);
  }

  private redirectBasedOnRole(): void {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'user') {
      this.router.navigate(['/tabs']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }
}
