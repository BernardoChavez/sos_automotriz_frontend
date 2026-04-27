import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculosService } from '../../../core/services/vehiculos';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehiculos.html'
})
export class VehiculosComponent implements OnInit {
  private vehiculoService = inject(VehiculosService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  vehiculos: any[] = [];
  vehiculosAgrupados: { [key: string]: any[] } = {};
  grupoExpandido: string | null = null;
  
  mostrarModal = false;

  toggleGrupo(key: string) {
    this.grupoExpandido = this.grupoExpandido === key ? null : key;
  }

  editando = false;
  vehiculoId: number | null = null;
  
  nuevoVehiculo = { placa: '', marca: '', modelo: '', color: '', anio: 2024 };

  get esSuperAdmin(): boolean {
    return this.authService.currentUser?.rol === 'super_admin';
  }

  ngOnInit() { this.cargarVehiculos(); }

  cargarVehiculos() {
    this.vehiculoService.getVehiculos().subscribe({
      next: (data) => {
        this.vehiculos = [...data];
        this.agruparVehiculos();
        this.cdr.detectChanges();
      }
    });
  }

  agruparVehiculos() {
    this.vehiculosAgrupados = {};
    if (!this.esSuperAdmin) return;

    this.vehiculos.forEach(v => {
      const owner = v.cliente_nombre || 'Sin Propietario';
      if (!this.vehiculosAgrupados[owner]) {
        this.vehiculosAgrupados[owner] = [];
      }
      this.vehiculosAgrupados[owner].push(v);
    });
  }


  abrirModal(vehiculo: any = null) {
    if (vehiculo) {
      this.editando = true;
      this.vehiculoId = vehiculo.id;
      this.nuevoVehiculo = { ...vehiculo };
    } else {
      this.editando = false;
      this.vehiculoId = null;
      this.nuevoVehiculo = { placa: '', marca: '', modelo: '', color: '', anio: 2024 };
    }
    this.mostrarModal = true;
  }

  cerrarModal() { this.mostrarModal = false; }

  guardar() {
    if (!this.esSuperAdmin) {
      if (!this.nuevoVehiculo.placa || !this.nuevoVehiculo.marca || !this.nuevoVehiculo.modelo) {
        alert('La placa, marca y modelo son campos obligatorios.');
        return;
      }
    }

    if (this.editando) {
      this.actualizar();
    } else {
      this.registrar();
    }
  }

  registrar() {
    const user = this.authService.currentUser;
    const payload = { ...this.nuevoVehiculo, cliente_id: user?.id };

    this.vehiculoService.crearVehiculo(payload).subscribe({
      next: () => {
        this.cargarVehiculos();
        this.cerrarModal();
      },
      error: (err: any) => alert("Error al guardar: " + (err.error?.detail || "Fallo"))
    });
  }

  actualizar() {
    if (!this.vehiculoId) return;
    this.vehiculoService.updateVehiculo(this.vehiculoId, this.nuevoVehiculo).subscribe({
      next: () => {
        this.cargarVehiculos();
        this.cerrarModal();
      },
      error: (err: any) => alert("Error al actualizar: " + (err.error?.detail || "Fallo"))
    });
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.vehiculoService.deleteVehiculo(id).subscribe({
        next: () => this.cargarVehiculos(),
        error: (err: any) => alert("Error al eliminar")
      });
    }
  }
}