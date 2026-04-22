import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculosService } from '../../../core/services/vehiculos';
import { AuthService } from '../../../core/services/auth'; // <--- Importante

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehiculos.html'
})
export class VehiculosComponent implements OnInit {
  private vehiculoService = inject(VehiculosService);
  private authService = inject(AuthService); // <--- Inyectamos para obtener el usuario
  private cdr = inject(ChangeDetectorRef);
  
  vehiculos: any[] = [];
  mostrarModal = false;
  nuevoVehiculo = { placa: '', marca: '', modelo: '', color: '', anio: 2024 };

  get esSuperAdmin(): boolean {
    return this.authService.currentUser?.rol === 'super_admin';
  }

  ngOnInit() { this.cargarVehiculos(); }

  cargarVehiculos() {
    this.vehiculoService.getVehiculos().subscribe({
      next: (data) => {
        this.vehiculos = [...data];
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal() { this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }

  registrar() {
    // Obtenemos el ID del usuario actual para que el backend lo reconozca
    const user = this.authService.currentUser;
    
    const payload = {
      ...this.nuevoVehiculo,
      cliente_id: user?.id // Enviamos el ID del usuario logueado
    };

    this.vehiculoService.crearVehiculo(payload).subscribe({
      next: () => {
        this.cargarVehiculos();
        this.cerrarModal();
        this.nuevoVehiculo = { placa: '', marca: '', modelo: '', color: '', anio: 2024 };
      },
      error: (err) => {
        alert("Error al guardar: " + (err.error?.detail || "Fallo de conexión"));
      }
    });
  }
}