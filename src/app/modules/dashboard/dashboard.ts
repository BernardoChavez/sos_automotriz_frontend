import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { StatsService } from '../../core/services/stats';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private statsService = inject(StatsService);
  private cdr = inject(ChangeDetectorRef);
  
  resumen: any = null;
  loading = true;

  ngOnInit() {
    // Esperamos a que el usuario esté cargado antes de pedir stats
    if (this.authService.currentUser) {
      this.cargarStats();
    } else {
      // Si no hay usuario aún, nos suscribimos al cambio o esperamos un poco
      setTimeout(() => this.cargarStats(), 500);
    }
  }

  cargarStats() {
    this.loading = true;
    this.statsService.getResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando dashboard:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoleName(): string {
    return this.authService.currentUser?.rol?.replace('_', ' ') || 'Usuario';
  }
}