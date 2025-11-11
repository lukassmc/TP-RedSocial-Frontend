import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  registerForm = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    ]],
    confirmPassword: ['', [Validators.required]],
    birthdate: ['', [Validators.required, this.dateValidator]],
    description: ['', [Validators.maxLength(500)]]
  }, {
    validators: this.passwordMatchValidator
  });

  
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    
    if (age < 13) {
      return { underage: true };
    }

    
    if (birthDate > today) {
      return { futureDate: true };
    }

    return null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'La imagen no puede superar los 5MB';
        event.target.value = '';
        return;
      }

      
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Solo se permiten archivos de imagen';
        event.target.value = '';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      return;
    }

    try {
      const formValues = this.registerForm.value;

      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('nombre', formValues.nombre || '');
        formData.append('apellido', formValues.apellido || '');
        formData.append('username', formValues.username || '');
        formData.append('email', formValues.email || '');
        formData.append('password', formValues.password || '');
        formData.append('birthdate', formValues.birthdate || '');
        formData.append('description', formValues.description || '');
        formData.append('profileImage', this.selectedFile);

        this.authService.register(formData).subscribe({
          next: (response) => {
            console.log('Registro exitoso:', response);
            this.successMessage = response.message || 'Registro exitoso. Redirigiendo...';
            this.authService.saveUser(response.data);
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error en registro:', error);
            if (error.status === 400) {
              this.errorMessage = error.error.message || 'Datos inválidos';
            } else if (error.status === 0) {
              this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
            } else {
              this.errorMessage = error.error?.message || 'Error al registrar usuario';
            }
          }
        });
      } else {
        const registerData = {
          nombre: formValues.nombre || '',
          apellido: formValues.apellido || '',
          username: formValues.username || '',
          email: formValues.email || '',
          password: formValues.password || '',
          birthdate: formValues.birthdate || '',
          description: formValues.description || ''
        };

        this.authService.register(registerData).subscribe({
          next: (response) => {
            console.log('Registro exitoso:', response);
            this.successMessage = response.message || 'Registro exitoso. Redirigiendo...';
            this.authService.saveUser(response.data);
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error en registro:', error);
            if (error.status === 400) {
              this.errorMessage = error.error.message || 'Datos inválidos';
            } else if (error.status === 0) {
              this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
            } else {
              this.errorMessage = error.error?.message || 'Error al registrar usuario';
            }
          }
        });
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Error inesperado al registrar usuario';
      console.error('Error en registro:', error);
    }
  }
}
