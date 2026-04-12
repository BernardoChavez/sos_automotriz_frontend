import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro'; // <--- 1. IMPORTARLO
import { VehiculosComponent } from './components/vehiculos/vehiculos';
import { DashboardAdminComponent } from './components/super-admin/dashboard-admin/dashboard-admin'
import { PanelTecnicoComponent } from './components/panel-tecnico/panel-tecnico';
import { DashboardTallerComponent } from './components/admin-taller/dashboard-taller/dashboard-taller';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },

    // 2. AÑADIR LA RUTA PARA EL REGISTRO
    { path: 'registro', component: RegistroComponent },

    {
        path: 'dashboard-admin',
        component: DashboardAdminComponent
    },
    { path: 'vehiculos', component: VehiculosComponent },
    { path: 'panel-tecnico', component: PanelTecnicoComponent },
    {
        path: 'dashboard-taller',
        component: DashboardTallerComponent
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];