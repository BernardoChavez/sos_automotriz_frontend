import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentesService } from '../../../core/services/incidentes';
import { TecnicosService } from '../../../core/services/tecnicos';
import { interval, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-asistencia-tecnico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <header class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            <h2 class="text-xl font-bold text-white uppercase tracking-tighter italic">Servicio <span class="text-blue-500">En Curso</span></h2>
          </div>
          <p class="text-slate-500 text-sm">Tu ubicación se está compartiendo en tiempo real con el cliente</p>
        </header>

        <!-- Status Card -->
        <div class="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700 shadow-inner">
           <div class="flex justify-between items-start mb-6">
              <div>
                <h3 class="text-white font-bold text-lg">Vehículo en Auxilio</h3>
                <p class="text-blue-400 text-xs font-bold uppercase tracking-widest">Estado Actual: {{ estadoActual }}</p>
              </div>
           </div>

           <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                 <i class="bi bi-geo-alt-fill text-red-500"></i>
                 <div class="text-sm">
                   <p class="text-slate-500 text-[10px] font-black uppercase">Destino</p>
                   <p class="text-slate-200">Ubicación del Incidente</p>
                 </div>
              </div>
           </div>
        </div>

        <!-- Tracking Toggle -->
        <div class="flex flex-col gap-4">
          <button *ngIf="estadoActual === 'aceptado'" (click)="actualizarEstado('en_camino')"
                  class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all">
             MARCAR: EN CAMINO
          </button>

          <button *ngIf="estadoActual === 'en_camino'" (click)="actualizarEstado('en_sitio')"
                  class="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg transition-all">
             MARCAR: LLEGUÉ AL SITIO
          </button>

          <button *ngIf="estadoActual === 'en_sitio'" (click)="actualizarEstado('finalizado')"
                  class="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transition-all">
             FINALIZAR Y COBRAR
          </button>
        </div>
        <!-- Formulario Final (Reemplazo de prompt) -->
        <div *ngIf="mostrarFormularioFinal" class="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700 mt-4 animate-in">
          <h3 class="text-white font-bold text-lg mb-4">Cierre del Servicio</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Diagnóstico Final</label>
              <textarea [(ngModel)]="diagnosticoFinal" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-xl text-white p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe el problema encontrado y la solución..."></textarea>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Costo Total (Bs.)</label>
              <input type="number" [(ngModel)]="montoFinal" class="w-full bg-slate-900 border border-slate-700 rounded-xl text-white p-3 text-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none" placeholder="0.00">
            </div>

            <button (click)="enviarCierre()" [disabled]="!diagnosticoFinal || montoFinal <= 0"
                    class="w-full py-4 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
               <i class="bi bi-check-circle-fill"></i> CONFIRMAR CIERRE Y COBRAR
            </button>
            <button (click)="mostrarFormularioFinal = false"
                    class="w-full py-3 mt-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-2xl transition-all text-sm">
               Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AsistenciaTecnicoComponent implements OnInit, OnDestroy {
  private tecnicosService = inject(TecnicosService);
  private incidentesService = inject(IncidentesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  private trackingSub?: Subscription;
  incidenteId: string = '';
  estadoActual: string = 'aceptado';
  
  // Variables para el formulario final
  mostrarFormularioFinal: boolean = false;
  diagnosticoFinal: string = '';
  montoFinal: number = 0;

  ngOnInit() {
    this.incidenteId = this.route.snapshot.params['id'];
    this.startLocationUpdates();
  }

  startLocationUpdates() {
    this.trackingSub = interval(5000).subscribe(() => {
      navigator.geolocation.getCurrentPosition(pos => {
        this.tecnicosService.actualizarUbicacion(pos.coords.latitude, pos.coords.longitude).subscribe();
      });
    });
  }

  actualizarEstado(nuevo: string) {
    if (nuevo === 'finalizado') {
      // En lugar de hacer la petición directo, mostramos el formulario
      this.mostrarFormularioFinal = true;
      return;
    }

    // CU25 & CU26: Usar el nuevo endpoint de gestión para bitácora
    this.incidentesService.actualizarEstadoGestion(this.incidenteId, nuevo).subscribe(res => {
      this.estadoActual = nuevo;
      this.cdr.detectChanges();
    });
  }

  enviarCierre() {
    if (this.diagnosticoFinal && this.montoFinal > 0) {
      // 1. Primero actualizamos la bitácora a 'finalizado'
      this.incidentesService.actualizarEstadoGestion(this.incidenteId, 'finalizado').subscribe(() => {
        this.estadoActual = 'finalizado';
        
        // 2. Enviamos los datos reales del servicio
        this.incidentesService.finalizarServicio(this.incidenteId, this.diagnosticoFinal, this.montoFinal).subscribe({
          next: () => {
            this.cdr.detectChanges();
            alert('¡Servicio finalizado exitosamente! El reporte y el costo han sido enviados al cliente.');
            this.router.navigate(['/dashboard/tecnico/mis-trabajos']);
          },
          error: (err) => {
            console.error(err);
            this.cdr.detectChanges();
            alert('Error al cerrar el servicio.');
          }
        });
      });
    }
  }

  ngOnDestroy() {
    this.trackingSub?.unsubscribe();
  }
}
