import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { StatsService } from '../../core/services/stats';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private statsService = inject(StatsService);
  
  resumen: any = null;

  ngOnInit() {
    this.authService.refreshUser(); // Refrescar permisos dinámicos al entrar
    this.statsService.getResumen().subscribe(data => {
      this.resumen = data;
    });
  }

  getRoleName(): string {
    const roles: any = {
      'super_admin': 'Super Administrador',
      'admin_taller': 'Administrador de Taller',
      'tecnico': 'Técnico Especialista',
      'cliente': 'Cliente'
    };
    return roles[this.authService.currentUser?.rol] || 'Usuario';
  }
}