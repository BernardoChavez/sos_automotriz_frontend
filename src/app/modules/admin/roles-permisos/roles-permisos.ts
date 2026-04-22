import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermisosService } from '../../../core/services/permisos';

@Component({
  selector: 'app-roles-permisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-permisos.html'
})
export class RolesPermisosComponent implements OnInit {
  private permisosService = inject(PermisosService);
  private cdr = inject(ChangeDetectorRef);
  
  matriz: any[] = [];
  roles = ['cliente', 'admin_taller', 'tecnico'];

  ngOnInit() { this.cargarMatriz(); }

  cargarMatriz() {
    this.permisosService.getMatriz().subscribe({
      next: (data) => {
        this.matriz = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar matriz:', err);
      }
    });
  }

  toggle(rol: string, permisoId: number) {
    this.permisosService.togglePermiso(rol, permisoId).subscribe(() => {
      this.cargarMatriz();
    });
  }
}
