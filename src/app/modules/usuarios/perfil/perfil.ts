import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { UsuariosService } from '../../../core/services/usuarios';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html'
})
export class PerfilComponent implements OnInit {
  public authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);

  user: any = { nombre: '', email: '', telefono: '', password: '' };
  loading = false;

  ngOnInit() {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.user = { ...currentUser, password: '' };
    }
  }

  guardar() {
    this.loading = true;
    const payload = { ...this.user };
    if (!payload.password) delete payload.password; // No enviar si está vacío

    this.usuariosService.actualizarUsuario(this.user.id, payload).subscribe({
      next: (res) => {
        alert('Perfil actualizado con éxito');
        // Actualizamos los datos en el AuthService para que el nombre cambie en el sidebar
        this.authService.updateStoredUser(res);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Error al actualizar perfil');
        this.loading = false;
      }
    });
  }
}
