import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments'; // Agregado

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  error: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  onLogin() {
    this.error = '';

    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Por favor, completa todos los campos';
      return;
    }

    const body = new FormData();
    body.append('username', this.credentials.email);
    body.append('password', this.credentials.password);

    // URL Vinculada
    this.http.post<any>(`${environment.apiUrl}/usuarios/login`, body).subscribe({
      next: (res) => {
        localStorage.clear();
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user_info));

        const rol = res.user_info.rol.toLowerCase().trim();

        switch (rol) {
          case 'super_admin':
          case 'admin':
            this.router.navigate(['/dashboard-admin']);
            break;
          case 'admin_taller':
            this.router.navigate(['/dashboard-taller']);
            break;
          case 'tecnico':
            this.router.navigate(['/panel-tecnico']);
            break;
          default:
            this.router.navigate(['/vehiculos']);
            break;
        }
      },
      error: (err) => {
        this.error = err.error?.detail || 'Correo o contraseña incorrectos';
      }
    });
  }
}