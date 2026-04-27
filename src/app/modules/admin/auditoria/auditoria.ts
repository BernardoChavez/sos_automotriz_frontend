import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditoriaService } from '../../../core/services/auditoria';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto animate-in">
        <header class="mb-10">
            <h1 class="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">Bitácora del <span class="text-blue-600">Sistema</span></h1>
            <p class="text-slate-500 font-medium">Historial de auditoría en tiempo real</p>
        </header>

        <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div class="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 class="font-black text-slate-800 uppercase tracking-tighter">Registros de actividad</h3>
                    <p class="text-[10px] text-blue-600 font-black uppercase tracking-widest">{{ logs.length }} registros procesados</p>
                </div>
                <button (click)="cargarLogs()" class="w-12 h-12 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-center text-slate-400 hover:text-blue-600">
                    <i class="bi bi-arrow-clockwise text-xl"></i>
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th class="px-8 py-6">Usuario</th>
                            <th class="px-8 py-6 text-center">Acción</th>
                            <th class="px-8 py-6">Detalle de actividad</th>
                            <th class="px-8 py-6">IP Acceso</th>
                            <th class="px-8 py-6">Fecha</th>
                            <th class="px-8 py-6">Inicio</th>
                            <th class="px-8 py-6">Cierre</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <tr *ngFor="let log of logs" class="hover:bg-blue-50/30 transition-all text-sm group">
                            <td class="px-8 py-6 font-bold text-slate-700 tracking-tight">{{ log.nombre }}</td>
                            <td class="px-8 py-6 text-center">
                                <span class="px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm"
                                      [ngClass]="{
                                        'bg-blue-600 text-white': log.accion === 'GET',
                                        'bg-green-600 text-white': log.accion === 'POST',
                                        'bg-amber-500 text-white': log.accion === 'PUT',
                                        'bg-red-600 text-white': log.accion === 'DELETE'
                                      }">{{ log.accion }}</span>
                            </td>
                            <td class="px-8 py-6 text-slate-600 font-medium italic">{{ log.detalle }}</td>
                            <td class="px-8 py-6 text-slate-400 font-mono text-[10px]">{{ log.ip }}</td>
                            <td class="px-8 py-6 text-slate-500 font-bold text-xs">{{ log.fecha }}</td>
                            <td class="px-8 py-6 text-slate-600 font-medium">{{ log.hora_inicio }}</td>
                            <td class="px-8 py-6">
                                <span *ngIf="log.hora_cierre === 'Activo'" class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Activo
                                </span>
                                <span *ngIf="log.hora_cierre !== 'Activo'" class="text-slate-400 font-medium text-xs">
                                    {{ log.hora_cierre }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `
})
export class AuditoriaComponent implements OnInit {
  private auditoriaService = inject(AuditoriaService);
  logs: any[] = [];

  ngOnInit() {
    this.cargarLogs();
  }

  cargarLogs() {
    this.auditoriaService.getLogs().subscribe(res => {
      this.logs = res;
    });
  }
}

