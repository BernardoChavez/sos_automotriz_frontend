import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'auth/login', 
    loadComponent: () => import('./modules/auth/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'auth/register', 
    loadComponent: () => import('./modules/auth/register/register').then(m => m.RegisterComponent) 
  },
  { 
    path: 'auth/recovery', 
    loadComponent: () => import('./modules/auth/recovery/recovery').then(m => m.RecoveryComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./shared/layout/layout').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'cliente/vehiculos',
        // Asegúrate de que el archivo se llame 'vehiculos.ts' y no 'vehiculos.component.ts'
        loadComponent: () => import('./modules/cliente/vehiculos/vehiculos').then(m => m.VehiculosComponent)
      },

       {
         path: 'admin/usuarios',
         loadComponent: () => import('./modules/admin/usuarios/usuarios').then(m => m.UsuariosComponent)
       },
       {
         path: 'admin/talleres',
         loadComponent: () => import('./modules/admin/talleres/talleres').then(m => m.TalleresComponent)
       },
       {
         path: 'admin/roles-permisos',
         loadComponent: () => import('./modules/admin/roles-permisos/roles-permisos').then(m => m.RolesPermisosComponent)
       },
       {
         path: 'taller/tecnicos',
         loadComponent: () => import('./modules/taller/tecnicos/tecnicos').then(m => m.TecnicosComponent)
       },
       {
         path: 'taller/configuracion',
         loadComponent: () => import('./modules/taller/configuracion/configuracion').then(m => m.ConfiguracionTallerComponent)
       }
    ]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];