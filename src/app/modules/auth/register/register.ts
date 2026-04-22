import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = { nombre: '', email: '', telefono: '', password: '', rol: 'cliente' };
  loading = false;
  errorMessage = '';

  onRegister() {
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.register(this.user).subscribe({
      next: () => {
        alert('Registro exitoso. Ya puedes iniciar sesión.');
        this.router.navigate(['/auth/login']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.detail || 'Error al registrar usuario';
        this.loading = false;
      }
    });
  }
}
