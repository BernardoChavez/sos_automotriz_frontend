import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentesService } from '../../../core/services/incidentes';
import { AuthService } from '../../../core/services/auth';
import { TecnicosService } from '../../../core/services/tecnicos';

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-black text-white italic uppercase tracking-tighter">Panel de <span class="text-blue-500">Despacho</span></h1>
          <p class="text-slate-500 text-sm">Gestiona emergencias asignadas por la IA</p>
        </div>
        <div class="flex gap-2">
           <span class="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-slate-300 text-sm font-bold">
             {{solicitudes.length}} PENDIENTES
           </span>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        @for (s of solicitudes; track s.id) {
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-blue-500/50 transition-all group overflow-hidden relative">
            <!-- Priority Indicator -->
            <div class="absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest"
              [class.bg-red-500]="s.prioridad_final === 'Alta'"
              [class.bg-yellow-500]="s.prioridad_final === 'Media'"
              [class.bg-blue-500]="s.prioridad_final === 'Baja'">
              {{s.prioridad_final}}
            </div>

            <div class="flex gap-6">
              <!-- IA Summary & Images -->
              <div class="w-1/3">
                  <div class="aspect-square bg-slate-800 rounded-2xl overflow-hidden mb-3 border border-slate-700">
                    <img [src]="getFotoUrl(s.evidencias)" 
                         class="w-full h-full object-cover"
                         (error)="$any($event.target).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400'">
                  </div>
                 <div class="flex gap-1">
                   @for (e of s.evidencias; track e.id) {
                    <div class="w-8 h-8 rounded-md bg-slate-800 border border-slate-700"></div>
                   }
                 </div>
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div class="mb-4">
                  <h3 class="text-white font-bold text-lg leading-tight mb-1">{{s.resumen_ia || 'Analizando incidente...'}}</h3>
                  <p class="text-xs text-slate-500">ID: {{s.id.slice(0,8)}} • {{s.fecha_creacion | date:'shortTime'}}</p>
                </div>

                <div class="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 mb-6">
                   <div class="flex items-center justify-between mb-2">
                     <span class="text-[10px] text-slate-500 font-bold uppercase">Transcripción Voz</span>
                     <i class="fas fa-robot text-blue-400 text-xs"></i>
                   </div>
                   <p class="text-sm text-slate-300 italic">"{{s.transcripcion_voz_ia || 'Sin transcripción disponible'}}"</p>
                </div>

                <div class="space-y-4">
                   <div>
                     <label class="block text-[10px] font-black text-slate-500 uppercase mb-2">Asignar Técnico</label>
                     <select #tecnicoSelect class="w-full bg-slate-800 border-slate-700 rounded-xl text-white text-sm p-2 outline-none focus:ring-1 focus:ring-blue-500">
                        <option [value]="null">Selecciona técnico disponible...</option>
                        @for (t of tecnicos; track t.id) {
                          <option [value]="t.id">{{t.nombre}} ({{t.especialidad_principal}})</option>
                        }
                     </select>
                   </div>

                   <div class="flex gap-2">
                      <button (click)="gestionar(s.id, 'aceptar', tecnicoSelect.value)" 
                        class="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-900/20">
                        ACEPTAR SERVICIO
                      </button>
                      <button (click)="gestionar(s.id, 'rechazar')" 
                        class="px-4 py-3 bg-slate-800 hover:bg-red-900/20 hover:text-red-500 text-slate-400 text-sm font-bold rounded-xl transition-all border border-slate-700">
                        <i class="fas fa-times"></i>
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-20 text-center bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
             <i class="fas fa-bell-slash text-5xl text-slate-700 mb-4"></i>
             <h3 class="text-xl font-bold text-slate-500 italic">Sin emergencias activas</h3>
             <p class="text-slate-600 text-sm">Las nuevas solicitudes aparecerán aquí en tiempo real</p>
          </div>
        }
      </div>
    </div>
  `
})
export class DespachoComponent implements OnInit {
  private incidentesService = inject(IncidentesService);
  private authService = inject(AuthService);
  private tecnicosService = inject(TecnicosService);
  private cdr = inject(ChangeDetectorRef);

  solicitudes: any[] = [];
  tecnicos: any[] = [];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const user = this.authService.currentUser;
    console.log('Cargando datos para taller:', user?.taller_id);
    if (user && user.taller_id) {
      this.incidentesService.getSolicitudesTaller(user.taller_id).subscribe({
        next: (res) => {
          console.log('Solicitudes recibidas:', res);
          this.solicitudes = res.filter(s => s.estado === 'asignado' || s.estado === 'pendiente');
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando solicitudes:', err)
      });
      
      this.tecnicosService.getTecnicos(user.taller_id).subscribe({
        next: (res) => {
          console.log('Tecnicos recibidos:', res);
          this.tecnicos = res.filter(t => t.disponible);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando tecnicos:', err)
      });
    } else {
      console.warn('Usuario no tiene taller_id vinculado');
    }
  }

  gestionar(id: string, accion: 'aceptar' | 'rechazar', tecnicoId?: any) {
    if (accion === 'aceptar' && (!tecnicoId || tecnicoId === 'null')) {
      alert('Por favor, selecciona un técnico disponible antes de aceptar el servicio.');
      return;
    }

    const tId = (tecnicoId && tecnicoId !== 'null') ? Number(tecnicoId) : undefined;
    
    this.incidentesService.gestionarIncidente(id, accion, tId).subscribe({
      next: () => {
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al gestionar incidente:', err);
        alert('Hubo un error al procesar la solicitud.');
      }
    });
  }

  getFotoUrl(evidencias: any[]): string {
    if (!evidencias || evidencias.length === 0) return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400';
    const foto = evidencias.find(e => e.tipo_recurso === 'foto' || e.url_recurso.match(/\.(jpeg|jpg|gif|png)$/));
    return foto ? foto.url_recurso : 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400';
  }
}
