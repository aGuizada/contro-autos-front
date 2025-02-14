import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  emailLink: SafeResourceUrl;
  whatsappLink: SafeResourceUrl;

  constructor(
    private fb: FormBuilder,
    private authService: ServiciosService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.emailLink = this.sanitizer.bypassSecurityTrustResourceUrl('mailto:arminguizada@gmail.com');
    this.whatsappLink = this.sanitizer.bypassSecurityTrustResourceUrl('https://wa.me/62648482');
  }

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

    const loginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response: LoginResponse) => {
        this.handleLoginSuccess(response);
      },
      error: (error) => {
        this.handleLoginError(error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private handleLoginSuccess(response: LoginResponse): void {
    if (response.token) {
      // Guardar el token en localStorage
      localStorage.setItem('token', response.token);
      console.log('Token guardado:', response.token);

      // Guardar el email del usuario (no se recomienda guardar la contraseña)
      const email = this.loginForm.value.email;
      localStorage.setItem('emailUsuario', email);
      console.log('Correo electrónico guardado:', email);

      // Obtener el rol del usuario
      this.authService.getUserRole().subscribe({
        next: (userInfo: any) => {
          console.log('Respuesta del rol del usuario:', userInfo);

          if (userInfo.role) {
            localStorage.setItem('userRole', userInfo.role.toString());
            console.log('Rol del usuario:', userInfo.role);

            // Redirigir según el rol
            this.redirectBasedOnRole();
          } else {
            console.log('No se encontró el rol');
            this.errorMessage = 'Error al obtener el rol del usuario';
          }
        },
        error: (error) => {
          console.error('Error al obtener el rol:', error);
          this.errorMessage = 'Error al obtener el rol del usuario';
        }
      });
    } else {
      this.errorMessage = 'Error en la respuesta del servidor';
    }
  }

  private handleLoginError(error: any): void {
    console.error('Login error:', error);
    this.errorMessage = error.error?.message || 'Error al iniciar sesión. Por favor, intente nuevamente.';
    this.isLoading = false;
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
      return payload.exp < Date.now() / 1000; // Verificar si el token ha expirado
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return true; // Si hay un error, considerar el token como expirado
    }
  }
}
