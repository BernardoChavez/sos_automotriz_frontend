import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recovery.html'
})
export class RecoveryComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Estados del flujo: 1 = Email, 2 = Código y Nueva Clave, 3 = Éxito
  paso = 1;
  
  email = '';
  codigo = '';
  newPassword = '';
  confirmPassword = '';
  
  loading = false;
  errorMessage = '';

  // Paso 1: Solicitar código
  onRecover() {
    if (!this.email) {
      this.errorMessage = 'Por favor ingresa tu correo electrónico';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    console.log('Enviando solicitud de recuperación para:', this.email);
    
    this.authService.recoverPassword(this.email).subscribe({
      next: (res) => {
        console.log('Respuesta recibida en componente:', res);
        this.paso = 2;
        this.loading = false;
        this.cdr.detectChanges(); // Forzar actualización de la UI
        console.log('Paso 2 activado y loading=false');
      },
      error: (err: any) => {
        console.error('Error en recuperación:', err);
        this.errorMessage = err.error?.detail || 'Error al solicitar el código';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    // Respaldar por si la petición se queda en el limbo
    setTimeout(() => {
      if (this.loading) {
        console.warn('Timeout de seguridad: forzando fin de carga');
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 8000);
  }

  // Paso 2: Verificar código y restablecer
  onReset() {
    if (this.codigo.length !== 6) {
      this.errorMessage = 'El código debe ser de 6 caracteres';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const data = {
      email: this.email,
      code: this.codigo.toUpperCase(), // Asegurar que sea mayúsculas si el backend lo genera así
      new_password: this.newPassword
    };

    console.log('Enviando solicitud de cambio de contraseña...');
    this.authService.resetPassword(data).subscribe({
      next: (res) => {
        console.log('Respuesta de cambio recibida:', res);
        this.paso = 3;
        this.loading = false;
        this.cdr.detectChanges(); // Forzar actualización de la UI
        console.log('Paso 3 activado (Éxito)');
      },
      error: (err: any) => {
        console.error('Error al cambiar contraseña:', err);
        this.errorMessage = err.error?.detail || 'El código es incorrecto o ha expirado';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
