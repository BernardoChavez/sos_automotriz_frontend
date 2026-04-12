import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  link: string;
  roles: string[]; // Roles que pueden ver este item
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  user: any = null;
  menuItems: MenuItem[] = [
    { label: 'Panel Principal', icon: 'bi-grid-1x2', link: '/dashboard', roles: ['super_admin', 'admin', 'tecnico', 'cliente'] },

    // ADMINISTRACIÓN GLOBAL
    { label: 'Control de Roles', icon: 'bi-shield-lock', link: '/super-admin/roles', roles: ['super_admin'] },
    { label: 'Gestión de Talleres', icon: 'bi-building-gear', link: '/talleres', roles: ['super_admin'] },

    // GESTIÓN DE TALLER (Admin local)
    { label: 'Usuarios del Sistema', icon: 'bi-people', link: '/usuarios', roles: ['super_admin', 'admin'] },
    { label: 'Mi Equipo Técnico', icon: 'bi-person-badge', link: '/equipo', roles: ['admin'] },
    { label: 'Configurar Operación', icon: 'bi-sliders', link: '/configuracion', roles: ['admin'] },

    // CLIENTE
    { label: 'Mis Vehículos', icon: 'bi-car-front', link: '/vehiculos', roles: ['cliente', 'super_admin'] },
    { label: 'Solicitar Auxilio', icon: 'bi-geo-alt', link: '/auxilio', roles: ['cliente'] },

    // PERFIL (Todos)
    { label: 'Mi Perfil', icon: 'bi-person-circle', link: '/perfil', roles: ['super_admin', 'admin', 'tecnico', 'cliente'] },
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  // Función clave: Filtra los items según el rol del usuario logueado
  canSee(item: MenuItem): boolean {
    return this.user && item.roles.includes(this.user.rol);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}