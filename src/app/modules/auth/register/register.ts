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

  get passwordValidations() {
    const pw = this.user.password || '';
    return {
      min: pw.length >= 6,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      num: /[0-9]/.test(pw),
      spec: /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    };
  }

  get isPasswordStrong(): boolean {
    const v = this.passwordValidations;
    return v.min && v.upper && v.lower && v.num && v.spec;
  }

  onRegister() {
    this.loading = true;
    this.errorMessage = '';

    // 1. Validar campos obligatorios
    if (!this.user.nombre || !this.user.email || !this.user.telefono || !this.user.password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      this.loading = false;
      return;
    }

    // 2. Validar fortaleza de contraseña
    if (!this.isPasswordStrong) {
      this.errorMessage = 'La contraseña no cumple con todos los requisitos de seguridad';
      this.loading = false;
      return;
    }
    
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
