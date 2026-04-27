import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { NavbarComponent } from '../components/navbar/navbar';
import { AuditoriaService } from '../../core/services/auditoria';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth';
import { RealTimeService } from '../../core/services/real-time';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent implements OnInit {
  isSidebarOpen = false;
  private router = inject(Router);
  private auditoriaService = inject(AuditoriaService);
  private authService = inject(AuthService);
  private realTimeService = inject(RealTimeService);

  ngOnInit() {
    this.realTimeService.conectar();

    // CU33: Cada vez que cambiamos de apartado, cerramos el hito anterior en la bitácora
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.authService.currentUser) {
        this.auditoriaService.cerrarHitoActual().subscribe({
          error: () => { /* Ignorar errores si la sesión expiró */ }
        });
      }
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }


  closeSidebar() {
    this.isSidebarOpen = false;
  }
}