import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentesService } from '../../../core/services/incidentes';
import { AuthService } from '../../../core/services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-trabajos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 animate-in">
        <header class="mb-10">
            <h2 class="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Mis Trabajos <span class="text-blue-600">Asignados</span></h2>
            <p class="text-slate-500 font-medium">Gestiona tus servicios activos y estados de reparación.</p>
        </header>

        <div *ngIf="loading" class="flex justify-center py-20">
            <div class="spinner-border text-blue-600" role="status"></div>
        </div>

        <div *ngIf="!loading && trabajos.length === 0" class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
            <div class="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <i class="bi bi-briefcase text-slate-300 text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">No tienes trabajos activos</h3>
            <p class="text-slate-500 max-w-xs mx-auto">Cuando se te asigne una emergencia, aparecerá aquí.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="!loading">
            <div *ngFor="let t of trabajos" class="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden hover:translate-y-[-8px] transition-all group">
                <div class="p-8">
                    <div class="flex justify-between items-start mb-6">
                        <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            {{ t.estado }}
                        </span>
                        <span class="text-[10px] font-bold text-slate-400">ID: {{ t.id.slice(0,6).toUpperCase() }}</span>
                    </div>

                    <h4 class="text-xl font-black text-slate-800 mb-2 italic">Emergencia en Curso</h4>
                    <p class="text-slate-500 text-sm mb-6 flex items-center gap-2 font-medium">
                        <i class="bi bi-geo-alt-fill text-red-500"></i>
                        Ver ubicación en mapa
                    </p>

                    <div class="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diagnóstico IA</p>
                        <p class="text-slate-700 text-sm font-medium line-clamp-2 italic">
                            "{{ t.resumen_ia || 'Analizando reporte del cliente...' }}"
                        </p>
                    </div>

                    <button [routerLink]="['/dashboard/tecnico/asistencia', t.id]" 
                            class="w-full py-4 bg-slate-900 text-white font-black rounded-xl group-hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
                        GESTIONAR AHORA
                    </button>
                </div>
            </div>
        </div>
    </div>
  `
})
export class MisTrabajosComponent implements OnInit {
  private incidentesService = inject(IncidentesService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  trabajos: any[] = [];
  loading = true;

  ngOnInit() {
    this.cargarTrabajos();
  }

  cargarTrabajos() {
    const user = this.authService.currentUser;
    if (!user) return;

    this.loading = true;
    this.incidentesService.getMisTrabajosTecnico().subscribe({
      next: (res) => {
        this.trabajos = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
