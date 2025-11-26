import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { dateNotInFuture, minAge } from '../../validators/date.validators';

@Component({
  selector: 'app-dashboard-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], 
  templateUrl: './dashboard-users.html',
  styleUrls: ['./dashboard-users.css']
})
export class DashboardUsers implements OnInit {
  users: any[] = [];
  isLoading = true;
  createUserForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private authService: AuthService
  ) {
   
    this.createUserForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      birthdate: ['', Validators.required, dateNotInFuture(), minAge(13) ],
      role: ['usuario', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.isLoading = false;
      }
    });
  }

  onCreateUser(): void {
    if (this.createUserForm.invalid) {
      
      Object.values(this.createUserForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.userService.createUserByAdmin(this.createUserForm.value).subscribe({
      next: () => {
        console.log('Usuario creado con éxito');
        alert('Usuario creado exitosamente.');
        this.loadUsers(); 
        this.resetForm();
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        alert('Hubo un error al crear el usuario.');
      }
    });
  }

  onToggleActive(userId: string): void {
    this.userService.toggleUserActive(userId).subscribe({
      next: (updatedUser) => {
        console.log('Estado de usuario actualizado');
        const index = this.users.findIndex(u => u._id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        
        alert(err.error.message || 'Hubo un error al cambiar el estado.');
      }
    });
  }

  resetForm(): void {
    this.createUserForm.reset({
      role: 'usuario' 
    });
  }
}