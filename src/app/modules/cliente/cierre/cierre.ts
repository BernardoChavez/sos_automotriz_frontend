import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentesService } from '../../../core/services/incidentes';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cierre-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto animate-in">
      <div class="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div class="bg-slate-900 p-10 text-center text-white relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
            <div class="relative z-10">
                <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/40">
                    <i class="bi bi-check-lg text-4xl"></i>
                </div>
                <h2 class="text-3xl font-black italic">¡SERVICIO COMPLETADO!</h2>
                <p class="text-slate-400 font-medium mt-2">Tu folio #{{incidenteId.slice(0,6).toUpperCase()}} está listo para el cierre.</p>
            </div>
        </div>

        <div class="p-10">
            <!-- Sección Pago -->
            <div *ngIf="paso === 'pago'" class="animate-in">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="font-black text-slate-800 text-xl uppercase tracking-tighter">1. Pago del Servicio</h3>
                    <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Pendiente</span>
                </div>
                
                <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center mb-8">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SOS-PAGO-{{incidenteId}}" 
                         class="mx-auto mb-6 shadow-2xl rounded-2xl border-4 border-white" alt="QR Pago">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Escanea para Pagar</p>
                    <h4 class="text-5xl font-black text-slate-900 italic mb-6">Bs. {{ monto }}</h4>
                    
                    <div class="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden group cursor-pointer hover:border-blue-500 transition-all">
                        <input type="file" class="absolute inset-0 opacity-0 cursor-pointer z-10" (change)="comprobanteSubido = true">
                        <div class="flex flex-col items-center gap-2" *ngIf="!comprobanteSubido">
                            <i class="bi bi-cloud-arrow-up text-3xl text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Haz clic para subir comprobante</span>
                        </div>
                        <div class="flex flex-col items-center gap-2" *ngIf="comprobanteSubido">
                            <i class="bi bi-file-earmark-check-fill text-3xl text-green-500"></i>
                            <span class="text-xs font-bold text-green-600 uppercase tracking-widest">comprobante_banco.jpg listo</span>
                        </div>
                    </div>
                </div>

                <button (click)="pagar()" 
                        [disabled]="loading || !comprobanteSubido"
                        class="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="bi bi-shield-check" *ngIf="!loading"></i>
                    <span *ngIf="!loading">ENVIAR COMPROBANTE Y CONFIRMAR</span>
                    <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
                </button>
            </div>

            <!-- Sección Calificación -->
            <div *ngIf="paso === 'calificar'" class="animate-in">
                <div class="text-center mb-10">
                    <h3 class="font-black text-slate-800 text-2xl italic mb-2">¿Cómo fue tu experiencia?</h3>
                    <p class="text-slate-500 font-medium">Tu opinión ayuda a mejorar a nuestros técnicos.</p>
                </div>

                <div class="flex justify-center gap-4 mb-10">
                    <button *ngFor="let s of [1,2,3,4,5]" (click)="estrellas = s" 
                            class="text-5xl transition-all hover:scale-125"
                            [class.text-amber-400]="estrellas >= s"
                            [class.text-slate-100]="estrellas < s">
                        <i class="bi" [class.bi-star-fill]="estrellas >= s" [class.bi-star]="estrellas < s"></i>
                    </button>
                </div>

                <div class="mb-8">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Comentario (Opcional)</label>
                    <textarea [(ngModel)]="comentario" placeholder="Escribe aquí tu reseña..."
                              class="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[120px] font-medium"></textarea>
                </div>

                <button (click)="enviarResena()" 
                        [disabled]="loading || estrellas === 0"
                        class="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-500/30 hover:bg-green-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3">
                    <i class="bi bi-send-fill" *ngIf="!loading"></i>
                    <span *ngIf="!loading">ENVIAR CALIFICACIÓN Y FINALIZAR</span>
                    <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
                </button>
            </div>
        </div>
      </div>
    </div>
  `
})
export class CierreClienteComponent implements OnInit {
  private incidentesService = inject(IncidentesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  incidenteId: string = '';
  paso: 'pago' | 'calificar' = 'pago';
  monto: number = 0;
  estrellas: number = 0;
  comentario: string = '';
  loading: boolean = false;
  comprobanteSubido: boolean = false;

  ngOnInit() {
    this.incidenteId = this.route.snapshot.params['id'];
    this.cargarMontoReal();
  }

  cargarMontoReal() {
    this.loading = true;
    this.incidentesService.getRastreo(this.incidenteId).subscribe({
      next: (res) => {
        if (res && res.monto_total !== undefined && res.monto_total !== null) {
          this.monto = res.monto_total;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        console.error("No se pudo obtener el monto real");
        this.cdr.detectChanges();
      }
    });
  }

  pagar() {
    this.loading = true;
    this.cdr.detectChanges();
    
    // Simular el tiempo de verificación bancaria del comprobante
    setTimeout(() => {
        this.incidentesService.procesarPago(this.incidenteId, 'QR_BPI', this.monto).subscribe({
          next: () => {
            this.loading = false;
            this.paso = 'calificar';
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            alert('Error al procesar el pago. Intenta de nuevo.');
            this.cdr.detectChanges();
          }
        });
    }, 3000);
  }

  enviarResena() {
    this.loading = true;
    this.incidentesService.dejarResena(this.incidenteId, this.estrellas, this.comentario).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        alert('¡Gracias por tu reseña! Volviendo al historial.');
        // CORRECCIÓN: Navegación a la ruta correcta dentro del dashboard
        this.router.navigate(['/dashboard/cliente/historial']);
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        alert('Error al enviar la reseña.');
      }
    });
  }
}
