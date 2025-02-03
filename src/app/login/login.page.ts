import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(
    private fb: FormBuilder,
    private authService: ServiciosService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initForm();
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
      // Guardar el token
      localStorage.setItem('token', response.token);
      console.log('Token guardado:', response.token);
  
      // Guardar el email del usuario (no se recomienda guardar la contraseña)
      const email = this.loginForm.value.email; // Obtener el email del formulario
      localStorage.setItem('emailUsuario', email);
      console.log('Correo electrónico guardado:', email);
    
      // Hacer una petición para obtener el rol del usuario
      this.authService.getUserRole().subscribe({
        next: (userInfo: any) => {
          console.log('Respuesta del rol del usuario:', userInfo); // Verifica la respuesta
    
          if (userInfo.role) {
            localStorage.setItem('userRole', userInfo.role.toString());
            console.log('Rol del usuario:', userInfo.role);
    
            // Redireccionar según el rol
            if (userInfo.role === 'admin') { // Cambié a 'admin'
              console.log('Inicio como ADMIN');
              this.router.navigate(['/admin']);
            } else if (userInfo.role === 'user') { // Cambié a 'user'
              console.log('Inicio como USUARIO');
              this.router.navigate(['/tabs']);
            }
          } else {
            console.log('No se encontró el rol');
          }
        },
        error: (error) => {
          console.error('Error al obtener el rol:', error);
          this.errorMessage = 'Error al obtener el rol del usuario';
          this.router.navigate(['/tabs']);
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
}