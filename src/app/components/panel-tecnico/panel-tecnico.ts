import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { environment } from '../../../environments'; // Agregado

@Component({
  selector: 'app-panel-tecnico',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './panel-tecnico.html'
})
export class PanelTecnicoComponent implements OnInit {
  tecnico: any = {};
  estaDisponible: boolean = true;
  serviciosPendientes: any[] = [];
  historialTrabajos: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.tecnico = JSON.parse(userData);
      this.obtenerEstadoSincronizado();
    } else {
      this.router.navigate(['/login']);
    }
  }

  obtenerEstadoSincronizado() {
    // URL Vinculada
    this.http.get<any[]>(`${environment.apiUrl}/usuarios/taller/${this.tecnico.taller_id}`).subscribe({
      next: (res) => {
        const yo = res.find(t => t.id === this.tecnico.id);
        if (yo) {
          this.estaDisponible = yo.disponible;
          this.cdr.detectChanges();
        }
      }
    });
  }

  toggleDisponibilidad() {
    const valorAEnviar = !this.estaDisponible;

    // URL Vinculada
    this.http.patch(`${environment.apiUrl}/usuarios/tecnicos/${this.tecnico.id}/disponibilidad?disponible=${valorAEnviar}`, {})
      .subscribe({
        next: (res: any) => {
          this.estaDisponible = res.disponible;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert("No se pudo conectar con el servidor para cambiar el estado");
        }
      });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}