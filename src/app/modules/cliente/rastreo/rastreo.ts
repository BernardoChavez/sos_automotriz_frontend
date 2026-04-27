import { Component, inject, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IncidentesService } from '../../../core/services/incidentes';
import { Router } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';

declare var L: any; // Variable global de Leaflet

@Component({
  selector: 'app-rastreo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto h-full flex flex-col animate-in">
      <div class="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl flex-1 flex flex-col overflow-hidden">
        <header class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <span class="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            SEGUIMIENTO EN VIVO
          </h2>
          <span class="px-4 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-full font-black uppercase tracking-widest border border-blue-500/20">
            ESTADO: {{trackingData?.estado || 'Sincronizando...'}}
          </span>
        </header>

        <!-- MAPA REAL (Leaflet) -->
        <div id="map" class="flex-1 rounded-[2rem] overflow-hidden mb-6 min-h-[400px] border border-slate-800 shadow-inner"></div>

        <!-- Info Card -->
        @if (trackingData && trackingData.estado !== 'completado') {
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/30 backdrop-blur-md">
              <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Llegada Estimada</p>
              <h3 class="text-3xl font-black text-white italic">{{trackingData.eta_estimado}}</h3>
            </div>
            <div class="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/30 backdrop-blur-md text-right">
              <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Distancia</p>
              <h3 class="text-3xl font-black text-blue-500 italic">{{trackingData.distancia_km}} km</h3>
            </div>
          </div>

          <!-- IA Diagnosis Card -->
          <div class="bg-blue-600/10 border border-blue-500/20 rounded-[2rem] p-6 mb-6">
             <div class="flex items-center gap-2 mb-3 text-blue-400 font-bold text-xs uppercase tracking-widest">
               <i class="fas fa-robot"></i> Diagnóstico IA
             </div>
             <p class="text-white font-bold mb-2">{{trackingData.resumen_ia || 'Analizando incidente...'}}</p>
             <p class="text-slate-400 text-sm italic">"{{trackingData.transcripcion_voz_ia || 'Escuchando reporte...'}}"</p>
          </div>
        }

        <!-- SECCIÓN DE PAGO -->
        <div *ngIf="trackingData?.estado === 'completado' && !pagoRealizado" class="mt-4 p-8 bg-blue-600 rounded-[2rem] text-center animate-in">
           <i class="bi bi-check-circle-fill text-5xl mb-4 block"></i>
           <h3 class="text-2xl font-black mb-1">¡SERVICIO FINALIZADO!</h3>
           <p class="text-blue-100 mb-6 font-medium text-sm">El técnico ha completado el trabajo. Por favor, procede al pago.</p>
           
           <button (click)="pagar()" class="w-full py-4 bg-white text-blue-600 font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
              CONFIRMAR PAGO (Bs. {{trackingData.monto_total || '0.00'}})
           </button>
        </div>

        <div *ngIf="pagoRealizado" class="mt-4 p-8 bg-green-600 rounded-[2rem] text-center animate-in">
           <i class="bi bi-shield-fill-check text-5xl mb-4 block"></i>
           <h3 class="text-2xl font-black mb-1">¡PAGO EXITOSO!</h3>
           <p class="text-green-100 mb-6 font-medium text-sm">Tu transacción ha sido procesada de forma segura.</p>
           
           <button (click)="descargarComprobante()" class="w-full py-4 bg-white text-green-600 font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
              <i class="bi bi-file-earmark-pdf-fill me-2"></i> DESCARGAR COMPROBANTE
           </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    #map { z-index: 1; background: #0f172a; }
    .animate-in { animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RastreoComponent implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private incidentesService = inject(IncidentesService);
  private cdr = inject(ChangeDetectorRef);
  
  incidenteId: string = '';
  trackingData: any = null;
  pollSub?: Subscription;
  pagoRealizado = false;

  // Leaflet Map Objects
  map: any;
  markerTecnico: any;
  markerCliente: any;

  ngOnInit() {
    this.incidenteId = this.route.snapshot.params['id'];
  }

  ngAfterViewInit() {
    this.initMap();
    this.startPolling();
  }

  initMap() {
    // Inicializar mapa centrado en Bolivia (por defecto)
    this.map = L.map('map').setView([-16.5000, -68.1500], 13);
    
    // Capa de mapa oscura (estilo premium)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(this.map);
  }

  startPolling() {
    this.pollSub = interval(3000).pipe(
      switchMap(() => this.incidentesService.getRastreo(this.incidenteId))
    ).subscribe({
      next: (data) => {
        this.trackingData = data;
        this.updateMapMarkers();
        this.cdr.detectChanges(); // SOLUCIÓN: Forzar actualización de UI

        // SOLUCIÓN: Si está finalizado, lo enviamos al cierre real (pago)
        if (data.estado === 'finalizado') {
          this.router.navigate(['/dashboard/cliente/cierre', this.incidenteId]);
        }
      },
      error: (err) => {
        console.error("Error al obtener rastreo", err);
      }
    });
  }

  updateMapMarkers() {
    if (!this.trackingData) return;

    const latC = this.trackingData.latitud_cliente || -16.5000;
    const lngC = this.trackingData.longitud_cliente || -68.1500;
    const latT = this.trackingData.latitud_tecnico;
    const lngT = this.trackingData.longitud_tecnico;

    // Marcador Cliente (Tú)
    if (!this.markerCliente) {
      this.markerCliente = L.marker([latC, lngC]).addTo(this.map).bindPopup('Tu ubicación').openPopup();
      this.map.setView([latC, lngC], 15);
    }

    // Marcador Técnico
    if (latT && lngT) {
      if (!this.markerTecnico) {
        const iconTec = L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
          iconSize: [40, 40]
        });
        this.markerTecnico = L.marker([latT, lngT], { icon: iconTec }).addTo(this.map).bindPopup('Técnico SOS').openPopup();
      } else {
        this.markerTecnico.setLatLng([latT, lngT]);
      }
    }
  }

  pagar() { this.pagoRealizado = true; }
  descargarComprobante() { alert("Generando PDF..."); }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }
}
