import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../navbar/navbar';
import { environment } from '../../../../environments'; // Agregado

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard-admin.html'
})
export class DashboardAdminComponent implements OnInit {
  pestanaActiva: string = 'talleres';
  talleres: any[] = [];
  nuevoTaller = { nombre: '', direccion: '', telefono: '', especialidad: 'General', latitud: -17.78, longitud: -63.18 };
  nuevoAdmin = { nombre: '', email: '', password: '', telefono: '', taller_id: null, rol: 'admin_taller' };

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.obtenerTalleres();
  }

  obtenerTalleres() {
    // URL Vinculada
    this.http.get<any[]>(`${environment.apiUrl}/talleres/`).subscribe({
      next: (res) => this.talleres = res,
      error: (err) => console.error("Error al obtener talleres", err)
    });
  }

  guardarTaller() {
    // URL Vinculada
    this.http.post(`${environment.apiUrl}/talleres/`, this.nuevoTaller).subscribe({
      next: () => {
        alert('¡Taller creado con éxito!');
        this.obtenerTalleres();
        this.nuevoTaller = { nombre: '', direccion: '', telefono: '', especialidad: 'General', latitud: -17.78, longitud: -63.18 };
      },
      error: () => alert('Error al crear el taller')
    });
  }

  registrarAdminTaller() {
    if (!this.nuevoAdmin.taller_id) {
      alert("Debes seleccionar un taller primero");
      return;
    }
    // URL Vinculada
    this.http.post(`${environment.apiUrl}/usuarios/registrar`, this.nuevoAdmin).subscribe({
      next: () => {
        alert('¡Administrador de Taller creado con éxito!');
        this.nuevoAdmin = { nombre: '', email: '', password: '', telefono: '', taller_id: null, rol: 'admin_taller' };
      },
      error: () => alert('Error al crear el administrador')
    });
  }
}