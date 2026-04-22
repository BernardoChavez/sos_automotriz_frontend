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

  taller: any = null;
  loading = true;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const tallerId = this.authService.currentUser?.taller_id;
    if (!tallerId) return;

    this.http.get(`${environment.apiUrl}/talleres/${tallerId}`).subscribe({
      next: (data) => {
        this.taller = data;
        // Inicializar horarios si están vacíos
        if (!this.taller.horarios_atencion) {
            this.taller.horarios_atencion = { Lunes: '08:00 - 18:00' };
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar() {
    const tallerId = this.authService.currentUser?.taller_id;
    this.http.put(`${environment.apiUrl}/talleres/${tallerId}`, this.taller).subscribe({
      next: () => {
        alert('Configuración guardada exitosamente');
      },
      error: () => alert('Error al guardar configuración')
    });
  }
}
