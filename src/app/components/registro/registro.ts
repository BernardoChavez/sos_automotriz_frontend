import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments'; // Agregado

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
})
export class RegistroComponent {
  user = {
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente',
    taller_id: null
  };

  // URL Vinculada
  private apiUrl = `${environment.apiUrl}/usuarios/registrar`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  onRegister() {
    if (!this.user.nombre || !this.user.email || !this.user.password || !this.user.telefono) {
      alert('Por favor, completa todos los campos para continuar.');
      return;
    }

    this.http.post(this.apiUrl, this.user).subscribe({
      next: (response) => {
        alert('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const detalle = err.error?.detail || 'Error de conexión con el servidor';
        alert('No se pudo registrar: ' + detalle);
      }
    });
  }
}