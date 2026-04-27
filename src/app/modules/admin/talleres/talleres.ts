import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TalleresService } from '../../../core/services/talleres';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],

  templateUrl: './talleres.html'
})
export class TalleresComponent implements OnInit {
  private talleresService = inject(TalleresService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  talleres: any[] = [];
  mostrarModal = false;
  editando = false;
  idEditando: number | null = null;
  nuevoTaller: any = { nombre: '', direccion: '', especialidad: 'General', capacidad_teorica: 5, telefono: '', latitud: 0, longitud: 0 };

  ngOnInit() { this.cargarTalleres(); }

  cargarTalleres() {
    this.talleresService.getTalleres().subscribe({
      next: (data) => {
        const user = this.authService.currentUser;
        if (user && user.rol === 'admin_taller') {
          // Si es admin de taller, solo mostramos el suyo
          this.talleres = data.filter(t => t.id === user.taller_id);
        } else {
          // Si es super_admin, mostramos todos
          this.talleres = [...data];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {}
    });
  }

  abrirModal(taller?: any) { 
    if (taller) {
      this.editando = true;
      this.idEditando = taller.id;
      this.nuevoTaller = { ...taller };
    } else {
      this.editando = false;
      this.idEditando = null;
      this.nuevoTaller = { nombre: '', direccion: '', especialidad: 'General', capacidad_teorica: 5, telefono: '', latitud: -17.78, longitud: -63.18 };
    }
    this.mostrarModal = true; 
  }
  
  cerrarModal() { this.mostrarModal = false; }

  guardar() {
    if (this.authService.currentUser?.rol !== 'super_admin') {
      if (!this.nuevoTaller.nombre || !this.nuevoTaller.direccion || !this.nuevoTaller.telefono) {
        alert('El nombre, dirección y teléfono del taller son obligatorios.');
        return;
      }
    }

    if (this.editando && this.idEditando) {
      this.talleresService.actualizarTaller(this.idEditando, this.nuevoTaller).subscribe(() => {
        this.cargarTalleres();
        this.cerrarModal();
      });
    } else {
      this.talleresService.crearTaller(this.nuevoTaller).subscribe(() => {
        this.cargarTalleres();
        this.cerrarModal();
      });
    }
  }

  eliminar(id: number) {
    if(confirm('¿Seguro?')) {
      this.talleresService.eliminarTaller(id).subscribe(() => this.cargarTalleres());
    }
  }

  getEstado(t: any): string {
    if (!t.esta_activo) return 'INACTIVO';
    
    // Obtener hora actual en Bolivia (UTC-4)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const boliviaHours = (utcHours - 4 + 24) % 24;
    
    const d = new Date();
    d.setHours(boliviaHours);
    d.setMinutes(now.getUTCMinutes());

    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaNum = now.getUTCDay(); 
    // Ajustar día si hubo cambio de fecha por zona horaria
    const tzOffset = (utcHours - 4);
    let diaAjustado = diaNum;
    if (tzOffset < 0 && boliviaHours > 12) diaAjustado = (diaNum - 1 + 7) % 7;
    else if (tzOffset >= 24) diaAjustado = (diaNum + 1) % 7;
    
    const diaActual = dias[diaAjustado];

    if (t.horarios_atencion && t.horarios_atencion[diaActual]) {
      const horario = t.horarios_atencion[diaActual];
      if (horario.includes('-')) {
        try {
          const [apertura, cierre] = horario.split('-');
          const ap_time = apertura.trim().replace('.', ':');
          const ci_time = cierre.trim().replace('.', ':');
          
          const horaStr = `${boliviaHours.toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
          
          if (horaStr >= ap_time && horaStr <= ci_time) {
            return 'ACTIVO';
          } else {
            return 'CERRADO (HORARIO)';
          }
        } catch(e) { return 'ACTIVO'; }
      }
    }
    return 'ACTIVO';
  }
}
