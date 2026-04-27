import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentesService } from '../../../core/services/incidentes';
import { VehiculosService } from '../../../core/services/vehiculos';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitar-ayuda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 lg:p-6 max-w-5xl mx-auto h-full flex flex-col justify-center animate-in">
      <div class="bg-slate-900 border border-slate-800 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 shadow-2xl overflow-y-auto relative main-scroll-container max-h-[90vh]">
        <!-- Glow decoration -->
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full"></div>
        
        <header class="mb-12 relative text-center">
          <div class="inline-flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 mb-4">
            <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span class="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Asistente de Emergencia IA</span>
          </div>
          <h1 class="text-5xl font-black text-white italic tracking-tighter mb-4">
            SOS <span class="text-blue-500">AUTOMOTRIZ</span>
          </h1>
          <p class="text-slate-400 font-medium max-w-lg mx-auto">Nuestro sistema inteligente analizará tu reporte en tiempo real para despachar la ayuda técnica más rápida.</p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
          <!-- Left: Selection & GPS -->
          <div class="space-y-8">
            <div class="group">
              <label class="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">1. Identificación del Vehículo</label>
              <div class="relative">
                <select [(ngModel)]="selectedVehiculoId" 
                        class="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl text-white p-5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer">
                  <option [value]="null" disabled>Selecciona el vehículo afectado...</option>
                  @for (v of vehiculos; track v.id) {
                    <option [value]="v.id">{{v.marca}} {{v.modelo}} ({{v.placa}})</option>
                  }
                </select>
                <i class="bi bi-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              </div>
            </div>

            <div class="bg-slate-800/30 p-8 rounded-[2rem] border border-slate-700/50 backdrop-blur-xl group hover:border-blue-500/50 transition-all">
              <div class="flex items-start gap-5 mb-4">
                <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20 transform group-hover:rotate-6 transition-transform">
                  <i class="bi bi-geo-alt-fill text-2xl"></i>
                </div>
                <div>
                  <h3 class="text-white font-black uppercase tracking-tighter text-xl">Ubicación GPS</h3>
                  <p class="text-xs text-slate-500 font-medium uppercase tracking-widest">Sincronización en curso</p>
                </div>
              </div>
              
              @if (coords) {
                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p class="text-sm text-blue-400 font-mono flex items-center gap-2">
                        <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        LAT: {{coords.lat.toFixed(6)}} | LNG: {{coords.lng.toFixed(6)}}
                    </p>
                </div>
              } @else {
                <button (click)="getUbicacion()" class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black rounded-xl transition-all uppercase tracking-[0.1em]">
                    Reintentar Conexión GPS
                </button>
              }
            </div>
          </div>

          <!-- Right: Multimedia Report -->
          <div class="space-y-8">
            <label class="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">2. Reporte de Evidencias</label>
            
            <!-- Audio Waveform Animation -->
            <div *ngIf="isRecording" class="flex items-center justify-center gap-1.5 h-16 px-6 bg-red-500/10 rounded-2xl border border-red-500/20 mb-4 animate-in">
              <div class="wave-bar bg-red-500 w-1 h-4 rounded-full animate-wave"></div>
              <div class="wave-bar bg-red-500 w-1 h-8 rounded-full animate-wave" style="animation-delay: 0.1s"></div>
              <div class="wave-bar bg-red-500 w-1 h-6 rounded-full animate-wave" style="animation-delay: 0.2s"></div>
              <div class="wave-bar bg-red-500 w-1 h-10 rounded-full animate-wave" style="animation-delay: 0.3s"></div>
              <div class="wave-bar bg-red-500 w-1 h-3 rounded-full animate-wave" style="animation-delay: 0.4s"></div>
              <div class="wave-bar bg-red-500 w-1 h-7 rounded-full animate-wave" style="animation-delay: 0.5s"></div>
              <span class="text-[10px] font-black text-red-500 ml-4 uppercase tracking-[0.3em]">Grabando Reporte de Voz...</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <button (click)="fileInput.click()" 
                class="relative h-40 flex flex-col items-center justify-center bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-[2rem] hover:border-blue-500 hover:bg-blue-500/5 transition-all group overflow-hidden">
                <div class="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <i class="bi bi-camera-fill text-4xl text-slate-500 group-hover:text-blue-500 mb-3 transition-colors"></i>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Añadir Foto</span>
                <input #fileInput type="file" (change)="onFileSelected($event)" hidden accept="image/*">
              </button>

              <button (click)="toggleRecording()" 
                class="relative h-40 flex flex-col items-center justify-center bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-[2rem] transition-all group overflow-hidden"
                [class.border-red-500]="isRecording"
                [class.bg-red-500/5]="isRecording">
                
                <div class="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-5 transition-opacity" [class.opacity-10]="isRecording"></div>
                
                <i class="bi text-4xl mb-3 transition-colors" 
                   [class.bi-mic-fill]="!isRecording" [class.bi-stop-circle-fill]="isRecording"
                   [class.text-slate-500]="!isRecording" [class.text-red-500]="isRecording"></i>
                
                <span class="text-[10px] font-black uppercase tracking-widest"
                      [class.text-slate-400]="!isRecording" [class.text-red-500]="isRecording">
                  {{isRecording ? 'DETENER GRABACIÓN' : 'REPORTE POR VOZ'}}
                </span>
              </button>
            </div>

            @if (evidenciasPreview.length > 0) {
              <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                @for (img of evidenciasPreview; track img) {
                  <div class="relative shrink-0 group">
                    <img [src]="img" class="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-lg group-hover:border-blue-500 transition-all">
                    
                    <!-- Botón Eliminar -->
                    <button (click)="eliminarImagen($index)" 
                            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg hover:bg-red-600 transition-all">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[8px] text-white">
                        <i class="bi bi-check"></i>
                    </div>
                  </div>
                }
              </div>
            }

            <button (click)="enviarSolicitud()" 
              [disabled]="loading || !selectedVehiculoId || !coords"
              class="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-900/40 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm">
              @if (loading) {
                <span class="spinner-border spinner-border-sm"></span> PROCESANDO CON IA...
              } @else {
                ENVIAR ALERTA DE AUXILIO <i class="bi bi-send-fill ms-2"></i>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-scroll-container {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .main-scroll-container::-webkit-scrollbar { display: none; }

    .animate-in { animation: slideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    
    .animate-wave { animation: wave 1.2s ease-in-out infinite; }
    @keyframes wave {
      0%, 100% { transform: scaleY(1); opacity: 0.5; }
      50% { transform: scaleY(1.8); opacity: 1; }
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class SolicitarAyudaComponent implements OnInit {
  private incidentesService = inject(IncidentesService);
  private vehiculosService = inject(VehiculosService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  vehiculos: any[] = [];
  selectedVehiculoId: number | null = null;
  coords: { lat: number, lng: number } | null = null;
  evidenciasPreview: string[] = [];
  files: File[] = [];
  
  loading = false;
  isRecording = false;
  incidenteResult: any = null;

  ngOnInit() {
    this.vehiculosService.getVehiculos().subscribe(v => this.vehiculos = v);
    this.getUbicacion();
  }

  getUbicacion() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.cdr.detectChanges();
      },
      (err) => {
        console.error("Error GPS", err);
        this.cdr.detectChanges();
      }
    );
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.files.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.evidenciasPreview.push(e.target.result);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  mediaRecorder: any;
  audioChunks: any[] = [];

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `reporte_voz_${Date.now()}.webm`, { type: 'audio/webm' });
        this.files.push(audioFile);
        alert("¡Audio capturado exitosamente!");
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.cdr.detectChanges();
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      alert("No se pudo acceder al micrófono.");
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
      this.cdr.detectChanges();
    }
  }

  eliminarImagen(index: number) {
    this.evidenciasPreview.splice(index, 1);
    this.files.splice(index, 1);
    this.cdr.detectChanges();
  }

  enviarSolicitud() {
    if (!this.selectedVehiculoId || !this.coords) {
      alert("Por favor selecciona un vehículo y activa el GPS");
      return;
    }
    
    this.loading = true;
    this.incidentesService.solicitarEmergencia({
      vehiculo_id: Number(this.selectedVehiculoId),
      latitud: this.coords.lat,
      longitud: this.coords.lng
    }).subscribe({
      next: (res) => {
        this.incidenteResult = res;
        
        if (this.files.length > 0) {
          this.files.forEach(f => {
            const tipo = f.type.includes('audio') ? 'audio' : 'foto';
            this.incidentesService.subirEvidencia(res.id, tipo, f).subscribe();
          });
        }
        
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/cliente/rastreo', res.id]);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
        alert("Error al enviar solicitud");
      }
    });
  }
}
