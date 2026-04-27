import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentesService } from '../../../core/services/incidentes';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';


@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto animate-in">
      <header class="mb-10 flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">
                {{ esAdminTaller ? 'Control de' : 'Historial de' }} 
                <span class="text-blue-600">{{ esAdminTaller ? 'Operaciones' : 'Servicios' }}</span>
            </h1>
            <p class="text-slate-500 font-medium">
                {{ esAdminTaller ? 'Supervisión de trabajos realizados por tu equipo técnico.' : 'Consulta el registro global de asistencias y estados.' }}
            </p>
        </div>
        <button (click)="cargarHistorial()" class="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <i class="bi bi-arrow-clockwise text-blue-600"></i>
        </button>
      </header>

      <!-- VISTA AGRUPADA (SUPER ADMIN -> CLIENTES | ADMIN TALLER -> TÉCNICOS) -->
      <div *ngIf="esSuperAdmin || esAdminTaller" class="space-y-4">
          <div *ngFor="let group of historialAgrupado | keyvalue" class="animate-in">
              <!-- Card del Grupo (Cliente o Técnico) -->
              <div (click)="toggleGrupo(group.key)" 
                   class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                   [ngClass]="{'border-slate-900 bg-slate-50/50': grupoExpandido === group.key}">
                  
                  <div class="flex items-center gap-5">
                      <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                           [ngClass]="grupoExpandido === group.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'">
                          <i class="bi" [ngClass]="esAdminTaller ? 'bi-wrench-adjustable' : 'bi-person-lines-fill'"></i>
                      </div>
                      <div>
                          <h2 class="text-lg font-black text-slate-800 uppercase tracking-tighter mb-0">{{ group.key }}</h2>
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {{ $any(group.value).length }} {{ esAdminTaller ? 'TRABAJOS REALIZADOS' : 'ASISTENCIAS REGISTRADAS' }}
                          </p>
                      </div>
                  </div>

                  <div class="flex items-center gap-4">
                      <span class="px-4 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-500 shadow-sm" *ngIf="grupoExpandido !== group.key">
                          VER DETALLES
                      </span>
                      <i class="bi text-xl transition-transform duration-300" 
                         [ngClass]="grupoExpandido === group.key ? 'bi-chevron-up text-slate-900' : 'bi-chevron-down text-slate-300'"></i>
                  </div>
              </div>

              <!-- Listado de Incidentes (Expandible) -->
              <div *ngIf="grupoExpandido === group.key" class="pt-6 pb-10 px-4 space-y-6 animate-in">
                  <div *ngFor="let item of $any(group.value)">
                      <ng-container *ngTemplateOutlet="historyCard; context: { item: item }"></ng-container>
                  </div>
              </div>
          </div>
      </div>

      <!-- VISTA PLANA (CLIENTE O TÉCNICO INDIVIDUAL) -->
      <div *ngIf="!esSuperAdmin && !esAdminTaller" class="space-y-6">
        <div *ngFor="let item of historial">
            <ng-container *ngTemplateOutlet="historyCard; context: { item: item }"></ng-container>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="historial.length === 0" class="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <div class="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <i class="bi bi-journal-x text-slate-200 text-5xl"></i>
            </div>
            <h3 class="text-2xl font-black text-slate-800 mb-2 italic">Sin registros</h3>
            <p class="text-slate-400 font-medium">Aún no tienes asistencias en tu historial.</p>
        </div>
      </div>

      <!-- MODAL COMPROBANTE -->
      <div *ngIf="mostrarReporte && reporteSeleccionado" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in">
                <div class="p-8 bg-slate-900 text-white text-center relative">
                    <button (click)="cerrarReporte()" class="absolute top-6 right-6 text-slate-400 hover:text-white">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-12">
                        <i class="bi bi-receipt-cutoff text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-black italic">RECIBO DE SERVICIO</h3>
                    <p class="text-blue-400 font-bold text-xs uppercase tracking-widest">Folio: #{{reporteSeleccionado.folio}}</p>
                </div>
                
                <div class="p-10 space-y-6">
                    <div class="flex justify-between border-b border-slate-100 pb-4">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</span>
                        <span class="font-bold text-slate-800">{{reporteSeleccionado.fecha}}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-100 pb-4">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taller</span>
                        <span class="font-bold text-blue-600">{{reporteSeleccionado.taller}}</span>
                    </div>
                    <div>
                        <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Diagnóstico Inteligente (IA)</span>
                        <p class="text-sm font-medium text-slate-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4 whitespace-pre-wrap">
                            {{(reporteSeleccionado.diagnostico_ia || 'Sin evaluación IA').replace('(CU2.2.10)', '')}}
                        </p>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Diagnóstico Técnico (Final)</span>
                        <p class="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                            {{(reporteSeleccionado.diagnostico_tecnico || 'Sin observaciones finales').replace('(CU2.2.10)', '')}}
                        </p>
                    </div>
                    <div class="bg-blue-50 p-6 rounded-2xl flex justify-between items-center">
                        <span class="text-sm font-black text-blue-900">MONTO TOTAL</span>
                        <span class="text-2xl font-black text-blue-600">Bs. {{reporteSeleccionado.monto_total | number:'1.2-2'}}</span>
                    </div>
                    
                    <div class="flex gap-3">
                        <button (click)="cerrarReporte()" 
                                class="w-1/3 py-4 bg-slate-100 text-slate-500 font-black rounded-xl hover:bg-slate-200 transition-all shadow-sm">
                            CERRAR
                        </button>
                        <button (click)="imprimirReporte()" 
                                class="w-2/3 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                            <i class="bi bi-printer"></i> DESCARGAR PDF
                        </button>
                    </div>
                </div>
            </div>
      </div>
    </div>

    <!-- Template para el Card de Historial -->
    <ng-template #historyCard let-item="item">
        <div class="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-50 flex flex-col md:flex-row gap-8 items-center hover:border-blue-100 transition-all group">
            <div class="bg-slate-50 p-6 rounded-[1.5rem] text-center min-w-[140px] group-hover:bg-blue-50 transition-all">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                <p class="text-sm font-black text-slate-800 mb-4">{{ item.fecha_creacion | date:'dd/MM/yyyy' }}</p>
                <div class="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <i class="bi bi-car-front-fill text-xl"></i>
                </div>
            </div>

            <div class="flex-grow">
                <div class="flex flex-wrap items-center gap-3 mb-3">
                    <span class="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                          [ngClass]="{
                            'bg-green-100 text-green-600 border-green-200': item.estado === 'pagado',
                            'bg-blue-100 text-blue-600 border-blue-200': item.estado === 'completado',
                            'bg-amber-100 text-amber-600 border-amber-200': ['en_camino', 'en_sitio', 'en_reparacion'].includes(item.estado),
                            'bg-slate-100 text-slate-500 border-slate-200': !['pagado', 'completado'].includes(item.estado)
                          }">
                        {{ item.estado === 'pagado' ? 'PAGADO ✓' : item.estado.toUpperCase() }}
                    </span>
                    <span class="text-slate-200">/</span>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridad {{ item.prioridad_final || 'Media' }}</span>
                </div>
                <h3 class="text-2xl font-black text-slate-800 mb-2 italic">
                    {{ item.resumen_ia || 'Diagnóstico del sistema' }}
                </h3>
                <div class="flex items-center gap-4 mb-2">
                    <div class="flex items-center gap-2" *ngIf="esSuperAdmin || esAdminTaller">
                        <i class="bi bi-person-circle text-blue-500"></i>
                        <span class="text-[10px] font-black text-slate-700 uppercase tracking-tighter">CLIENTE: {{ item.cliente_nombre }}</span>
                    </div>
                    <div class="flex items-center gap-2" *ngIf="esSuperAdmin || esAdminTaller">
                        <i class="bi bi-wrench text-blue-500"></i>
                        <span class="text-[10px] font-black text-slate-700 uppercase tracking-tighter">TÉCNICO: {{ item.tecnico_nombre }}</span>
                    </div>
                </div>
                <p class="text-slate-500 font-medium text-sm border-l-4 border-blue-500 pl-4 py-1">
                    {{ item.diagnostico_tecnico || 'Sin reporte técnico finalizado aún.' }}
                </p>
            </div>

            <div class="min-w-[220px] text-right flex flex-col items-center md:items-end gap-3">
                <div class="text-2xl font-black text-slate-800 mb-1" *ngIf="item.monto_total">
                    Bs. {{ item.monto_total }}
                </div>
                <div *ngIf="item.estado === 'finalizado' && !esSuperAdmin" class="w-full">
                    <button [routerLink]="['/dashboard/cliente/cierre', item.id]" 
                            class="w-full py-3 bg-red-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-red-200">
                        PAGAR AHORA
                    </button>
                </div>
                
                <div *ngIf="item.estado === 'pagado' && (!item.resenas || item.resenas.length === 0) && !esSuperAdmin" class="w-full">
                    <div class="flex justify-end gap-2 mb-3">
                        <i *ngFor="let s of [1,2,3,4,5]" (click)="ratingTemp[item.id] = s"
                           class="bi text-2xl cursor-pointer transition-all hover:scale-125"
                           [ngClass]="(ratingTemp[item.id] || 0) >= s ? 'bi-star-fill text-amber-400' : 'bi-star text-slate-200'"></i>
                    </div>
                    <button (click)="enviarCalificacion(item.id)" [disabled]="!ratingTemp[item.id]"
                            class="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest disabled:opacity-30">
                        CALIFICAR SERVICIO
                    </button>
                </div>
                
                <div *ngIf="item.resenas && item.resenas.length > 0" class="flex flex-col items-end w-full">
                    <div class="flex gap-1 mb-1">
                        <i *ngFor="let s of [1,2,3,4,5]" class="bi bi-star-fill text-sm" 
                           [class.text-amber-400]="item.resenas[0].calificacion >= s"
                           [class.text-slate-100]="item.resenas[0].calificacion < s"></i>
                    </div>
                    <span class="text-[10px] font-black text-green-600 uppercase tracking-widest italic mb-3">Servicio Calificado</span>
                </div>

                <div *ngIf="item.estado === 'pagado' || item.estado === 'completado'" class="w-full mt-auto">
                    <button (click)="verComprobante(item.id)" 
                            class="w-full py-3 bg-slate-50 border border-slate-200 text-slate-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                        <i class="bi bi-file-earmark-pdf"></i> VER COMPROBANTE
                    </button>
                </div>
            </div>
        </div>
    </ng-template>

  `
})
export class HistorialComponent implements OnInit {
  private incidentesService = inject(IncidentesService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  historial: any[] = [];
  historialAgrupado: { [key: string]: any[] } = {};
  grupoExpandido: string | null = null;
  
  ratingTemp: any = {};
  
  // Para CU28: Reporte/Comprobante
  reporteSeleccionado: any = null;
  mostrarReporte = false;

  toggleGrupo(key: string) {
    this.grupoExpandido = this.grupoExpandido === key ? null : key;
  }


  get esSuperAdmin(): boolean {
    return this.authService.currentUser?.rol === 'super_admin';
  }

  get esAdminTaller(): boolean {
    return this.authService.currentUser?.rol === 'admin_taller';
  }

  get esTecnico(): boolean {
    return this.authService.currentUser?.rol === 'tecnico';
  }

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.incidentesService.getMisSolicitudes().subscribe(res => {
      this.historial = res;
      this.agruparHistorial();
      this.cdr.detectChanges();
    });
  }

  agruparHistorial() {
    this.historialAgrupado = {};
    const rol = this.authService.currentUser?.rol;
    
    if (rol === 'super_admin') {
      this.historial.forEach(h => {
        const client = h.cliente_nombre || 'Desconocido';
        if (!this.historialAgrupado[client]) this.historialAgrupado[client] = [];
        this.historialAgrupado[client].push(h);
      });
    } else if (rol === 'admin_taller') {
      this.historial.forEach(h => {
        const tech = h.tecnico_nombre || 'Sin Técnico Asignado';
        if (!this.historialAgrupado[tech]) this.historialAgrupado[tech] = [];
        this.historialAgrupado[tech].push(h);
      });
    }
  }

  enviarCalificacion(id: string) {
    const cal = this.ratingTemp[id];
    this.incidentesService.calificarServicio(id, cal, "Excelente servicio").subscribe(() => {
      alert("¡Gracias por tu calificación!");
      this.cargarHistorial();
    });
  }

  verComprobante(id: string) {
    this.incidentesService.getReportePDF(id).subscribe(res => {
      this.reporteSeleccionado = res;
      this.mostrarReporte = true;
    });
  }

  cerrarReporte() {
    this.mostrarReporte = false;
    this.reporteSeleccionado = null;
  }

  imprimirReporte() {
    if (!this.reporteSeleccionado) return;
    const r = this.reporteSeleccionado;
    const diagIa = (r.diagnostico_ia || 'Evaluación no disponible.').replace('(CU2.2.10)', '').replace('(CU 2.2.10)', '');
    const diagTec = (r.diagnostico_tecnico || 'Sin observaciones adicionales.').replace('(CU2.2.10)', '').replace('(CU 2.2.10)', '');
    
    const html = `
      <html><head><title>Comprobante SOS Automotriz</title>
      <style>
        body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 900; font-style: italic; color: #0f172a; letter-spacing: -1px; }
        .logo span { color: #2563eb; }
        h1 { margin: 10px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 4px; color: #64748b; font-weight: 900; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .value { font-weight: bold; font-size: 14px; color: #0f172a; }
        .total { margin-top: 40px; background: #eff6ff; padding: 25px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #bfdbfe; }
        .total .label { color: #1e3a8a; font-size: 12px; font-weight: 900; }
        .total .value { color: #2563eb; font-size: 32px; font-weight: 900; letter-spacing: -1px; }
        @media print { body { padding: 0; } }
      </style>
      </head><body>
      <div class="header">
        <div class="logo">SOS <span>Automotriz</span></div>
        <h1>Detalles del Servicio</h1>
        <p style="color: #2563eb; font-size: 10px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">FOLIO: #${r.folio}</p>
      </div>
      <div class="row"><span class="label">Fecha de Emisión</span><span class="value">${r.fecha}</span></div>
      <div class="row"><span class="label">Cliente</span><span class="value">${r.cliente}</span></div>
      <div class="row"><span class="label">Vehículo</span><span class="value">${r.vehiculo}</span></div>
      <div class="row"><span class="label">Taller Asignado</span><span class="value">${r.taller}</span></div>
      
      <div style="margin-top: 30px;">
        <span class="label" style="display: block; margin-bottom: 10px; color: #2563eb;">Evaluación Inteligente (Gemini AI)</span>
        <p style="background: #eff6ff; padding: 20px; border-radius: 12px; border: 1px solid #bfdbfe; margin: 0; font-size: 14px; line-height: 1.6; color: #1e3a8a; white-space: pre-wrap;">
          ${diagIa}
        </p>
      </div>

      <div style="margin-top: 20px;">
        <span class="label" style="display: block; margin-bottom: 10px;">Reporte Final del Técnico</span>
        <p style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 0; font-size: 14px; line-height: 1.6; color: #475569; white-space: pre-wrap;">
          ${diagTec}
        </p>
      </div>
      <div class="total">
        <span class="label">MONTO TOTAL CANCELADO</span>
        <span class="value">Bs. ${r.monto_total}</span>
      </div>
      <div style="text-align: center; margin-top: 60px; font-size: 10px; color: #cbd5e1; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">
        Documento generado electrónicamente por SOS Automotriz
      </div>
      <script>window.onload = function() { window.print(); }</script>
      </body></html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(html);
    win?.document.close();
  }
}

