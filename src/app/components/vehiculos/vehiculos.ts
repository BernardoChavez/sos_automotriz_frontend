import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { environment } from '../../../environments';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './vehiculos.html'
})
export class VehiculosComponent implements OnInit {
  vehiculos: any[] = [];
  user: any = null;
  nuevo = { placa: '', marca: '', modelo: '', color: '', anio: 2026 };
  perfil = { nombre: '', telefono: '' };

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.perfil.nombre = this.user.nombre;
      this.perfil.telefono = this.user.telefono;
      this.getVehiculos();
    }
  }

  getVehiculos() {
    this.http.get<any[]>(`${this.apiUrl}/vehiculos/${this.user.id}`).subscribe({
      next: (res) => {
        this.vehiculos = [...res];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  guardar() {
    if (!this.nuevo.placa || !this.nuevo.marca) {
      alert('Placa y Marca son obligatorios');
      return;
    }
    const data = { ...this.nuevo, cliente_id: this.user.id };
    this.http.post(`${this.apiUrl}/vehiculos/`, data).subscribe({
      next: () => {
        this.getVehiculos();
        this.nuevo = { placa: '', marca: '', modelo: '', color: '', anio: 2026 };
      },
      error: (err) => alert('Error al registrar. Verifica la placa.')
    });
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar vehículo?')) {
      this.http.delete(`${this.apiUrl}/vehiculos/${id}`).subscribe({
        next: () => this.getVehiculos()
      });
    }
  }

  actualizarPerfil() {
    // Usamos el esquema UsuarioUpdate del backend: solo enviamos lo necesario
    const payload = {
      nombre: this.perfil.nombre,
      telefono: this.perfil.telefono
    };

    this.http.put(`${this.apiUrl}/${this.user.id}`, payload).subscribe({
      next: (res: any) => {
        alert('Perfil actualizado con éxito');

        // Actualizamos el objeto local mezclando los datos nuevos
        const usuarioActualizado = { ...this.user, ...res };
        localStorage.setItem('user', JSON.stringify(usuarioActualizado));

        // Recargamos para que el Navbar refleje el cambio de nombre de inmediato
        window.location.reload();
      },
      error: (err) => alert('Error al actualizar el perfil')
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}