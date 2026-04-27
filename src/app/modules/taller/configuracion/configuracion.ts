import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments';

@Component({
  selector: 'app-configuracion-taller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html'
})
export class ConfiguracionTallerComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  taller: any = {
    nombre: '',
    telefono: '',
    direccion: '',
    especialidad: '',
    capacidad_teorica: 5,
    esta_activo: true,
    horarios_atencion: {}
  };
  loading = true;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  ngOnInit() {
    if (this.authService.currentUser) {
        this.cargarDatos();
    } else {
        setTimeout(() => this.cargarDatos(), 500);
    }
  }

  cargarDatos() {
    const id = this.authService.currentUser?.taller_id;
    if (!id) {
        console.error("No se encontró ID de taller");
        this.loading = false;
        return;
    }

    const url = `${environment.apiUrl}/talleres/${id}`;
    console.log("Cargando datos de taller desde:", url);

    this.http.get(url).subscribe({
      next: (data) => {
        this.taller = data;
        if (!this.taller.horarios_atencion || Object.keys(this.taller.horarios_atencion).length === 0) {
            this.taller.horarios_atencion = {};
            this.diasSemana.forEach(d => this.taller.horarios_atencion[d] = '08:00 - 18:00');
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar() {
    if (this.authService.currentUser?.rol !== 'super_admin') {
      if (!this.taller.nombre || !this.taller.telefono || !this.taller.direccion) {
        alert('El nombre, teléfono y dirección del taller son obligatorios.');
        return;
      }
    }

    const id = this.authService.currentUser?.taller_id;
    if (!id) return;

    const url = `${environment.apiUrl}/talleres/${id}`;
    console.log("Guardando cambios en taller:", url);

    this.http.put(url, this.taller).subscribe({
      next: () => {
        alert('Configuración guardada exitosamente');
      },
      error: (err) => alert('Error al guardar: ' + (err.error?.detail || 'Fallo'))
    });
  }

  obtenerUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.taller.latitud = pos.coords.latitude;
          this.taller.longitud = pos.coords.longitude;
          this.cdr.detectChanges();
        },
        (err) => {
          alert('No se pudo obtener la ubicación. Por favor, asegúrate de dar permisos de GPS a tu navegador.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  }

  toggleEmergencia() {
    const id = this.authService.currentUser?.taller_id;
    if (!id) return;
    
    // Guardar inmediatamente y de forma independiente solo el estado del switch
    this.http.put(`${environment.apiUrl}/talleres/${id}`, {
      esta_activo: this.taller.esta_activo
    }).subscribe({
      next: () => {
        const msg = this.taller.esta_activo ? 'Taller ABIERTO manualmente.' : 'Taller CERRADO de emergencia.';
        alert(msg);
      },
      error: () => {
        alert('Error al cambiar estado.');
        this.taller.esta_activo = !this.taller.esta_activo; // Revertir en caso de error
      }
    });
  }
}
