import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TecnicosService } from '../../../core/services/tecnicos';
import { IncidentesService } from '../../../core/services/incidentes'; // <-- Importado
import { AuthService } from '../../../core/services/auth';
import { UsuariosService } from '../../../core/services/usuarios';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tecnicos.html'
})
export class TecnicosComponent implements OnInit {
  private tecnicosService = inject(TecnicosService);
  private incidentesService = inject(IncidentesService); // <-- Inyectado
  public authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);
  
  private gpsInterval: any;

  ngOnDestroy() {
    this.detenerGPS();
  }
  
  get esTecnico(): boolean {
    return this.authService.currentUser?.rol === 'tecnico';
  }

  get esSuperAdmin(): boolean {
    return this.authService.currentUser?.rol === 'super_admin';
  }
  
  tecnicos: any[] = [];
  tecnicosAgrupados: { [key: string]: any[] } = {};
  grupoExpandido: string | null = null;

  toggleGrupo(key: string) {
    this.grupoExpandido = this.grupoExpandido === key ? null : key;
  }

  miPerfil: any = { especialidad_principal: '', disponible: false };
  mostrarModal = false;
  nuevoTecnico = { nombre: '', email: '', password: '', rol: 'tecnico' };
  servicioActivo: any = null;
  diagnostico: string = ''; 
  montoFinal: number = 0;   


  ngOnInit() {
    // Aseguramos que el usuario esté cargado
    if (this.authService.currentUser) {
        this.inicializar();
    } else {
        // Si no está cargado, esperamos un poco (fallback)
        setTimeout(() => this.inicializar(), 500);
    }
  }

  inicializar() {
    if (this.esTecnico) {
      this.cargarMiPerfil();
    } else {
      this.cargarTecnicos();
    }
  }

  cargarMiPerfil() {
    this.tecnicosService.getMiPerfil().subscribe(res => {
      this.miPerfil = res;
      // Si el técnico está ocupado, buscamos el servicio que tiene asignado
      if (!res.disponible) {
         this.cargarServicioActivo();
      }
      this.cdr.detectChanges();
    });
  }

  cargarServicioActivo() {
    // Buscamos en el endpoint de solicitudes del taller, filtrando por el técnico actual
    const tallerId = this.authService.currentUser?.taller_id;
    if (tallerId) {
      this.incidentesService.getSolicitudesTaller(tallerId).subscribe(res => {
        this.servicioActivo = res.find((s: any) => s.tecnico_id === this.miPerfil.id && s.estado !== 'completado');
        this.cdr.detectChanges();
      });
    }
  }

  llegueAlLugar() {
    if (this.servicioActivo) {
      this.incidentesService.empezarReparacion(this.servicioActivo.id).subscribe(() => {
        this.servicioActivo.estado = 'en_reparacion';
        this.iniciarGPS();
        this.cdr.detectChanges();
      });
    }
  }

  iniciarGPS() {
    this.detenerGPS();
    // Simulación: Actualiza cada 10 segundos
    this.gpsInterval = setInterval(() => {
      // Pequeña variación para simular movimiento real si estamos en el lugar
      const lat = (this.servicioActivo.latitud || -17.7833) + (Math.random() - 0.5) * 0.001;
      const lng = (this.servicioActivo.longitud || -63.1821) + (Math.random() - 0.5) * 0.001;
      
      this.tecnicosService.actualizarUbicacion(lat, lng).subscribe({
        next: () => console.log('Ubicación GPS actualizada (CU24)'),
        error: (err) => console.error('Error GPS:', err)
      });
    }, 10000);
  }

  detenerGPS() {
    if (this.gpsInterval) {
      clearInterval(this.gpsInterval);
    }
  }

  finalizarServicio() {
    if (!this.diagnostico.trim() || this.montoFinal <= 0) {
      alert("Por favor escribe un diagnóstico y el monto cobrado.");
      return;
    }
    if (this.servicioActivo) {
      this.incidentesService.finalizarServicio(this.servicioActivo.id, this.diagnostico, this.montoFinal).subscribe(() => {
        alert("¡Servicio finalizado con éxito!");
        this.detenerGPS();
        this.servicioActivo = null;
        this.diagnostico = '';
        this.montoFinal = 0;
        this.cargarMiPerfil();
      });
    }
  }

  guardarMiPerfil() {
    this.tecnicosService.updateMiPerfil(this.miPerfil).subscribe(() => {
      alert('Perfil actualizado correctamente');
      this.cdr.detectChanges();
    });
  }

  cargarTecnicos() {
    const tallerId = this.esSuperAdmin ? undefined : this.authService.currentUser?.taller_id;
    this.tecnicosService.getTecnicos(tallerId).subscribe((data: any) => {
      this.tecnicos = data;
      this.agruparTecnicos();
      this.cdr.detectChanges();
    });
  }

  agruparTecnicos() {
    this.tecnicosAgrupados = {};
    if (!this.esSuperAdmin) return;

    this.tecnicos.forEach(t => {
      const workshop = t.taller_nombre || 'Sin Taller Asignado';
      if (!this.tecnicosAgrupados[workshop]) {
        this.tecnicosAgrupados[workshop] = [];
      }
      this.tecnicosAgrupados[workshop].push(t);
    });
  }


  abrirModal() {
    this.nuevoTecnico = { nombre: '', email: '', password: '', rol: 'tecnico' };
    this.mostrarModal = true;
  }

  guardar() {
    const tallerId = this.authService.currentUser?.taller_id;
    const payload = { ...this.nuevoTecnico, taller_id: tallerId };
    
    this.usuariosService.crearUsuario(payload).subscribe(() => {
      this.cargarTecnicos();
      this.mostrarModal = false;
    });
  }

  eliminar(id: number) {
    if(confirm('¿Seguro?')) {
      this.usuariosService.eliminarUsuario(id).subscribe(() => this.cargarTecnicos());
    }
  }
}
