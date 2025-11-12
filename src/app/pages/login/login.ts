import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  errorMessage: string = '';
  successMessage: string = '';
  passwordVisible = false;

  loginForm = this.formBuilder.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    // Limpiar mensajes
    this.errorMessage = '';
    this.successMessage = '';

    // Validar formulario
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      return;
    }

    // Obtener datos del formulario
    const loginData = {
      identifier: this.loginForm.value.identifier || '',
      password: this.loginForm.value.password || ''
    };

    // Llamar al servicio de autenticación
    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.successMessage = 'Login exitoso. Redirigiendo...';
        
        // Guardar datos del usuario en localStorage
        this.authService.saveUser(response.user)
        localStorage.setItem('access_token', response.access_token);
        
        // Redireccionar a la página de publicaciones
        setTimeout(() => {
          this.router.navigate(['/publicaciones']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error en login:', error);
        
        // Manejar diferentes tipos de errores
        if (error.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos';
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.errorMessage = error.error?.message || 'Error al iniciar sesión';
        }
      }
    });
  }
}
