import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesService } from '../../../core/services/notificaciones';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-notificaciones-full',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto animate-in">
      <header class="mb-10">
        <h1 class="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Centro de <span class="text-blue-600">Notificaciones</span></h1>
        <p class="text-slate-500 font-medium">Historial completo de alertas y actualizaciones en tiempo real.</p>
      </header>

      <div class="space-y-4">
        <div *ngFor="let n of notificaciones" 
             [ngClass]="n.leido ? 'bg-white' : 'bg-blue-50 border-blue-100'"
             class="p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4 transition-all hover:shadow-md">
          
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
               [ngClass]="n.leido ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'">
            <i class="bi" [ngClass]="n.icono || 'bi-bell-fill'"></i>
          </div>

          <div class="flex-grow">
            <div class="flex justify-between items-start mb-1">
              <h3 class="font-black text-slate-800 uppercase tracking-tight text-sm">{{ n.titulo }}</h3>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ n.fecha || n.tiempo }}</span>
            </div>
            <p class="text-slate-600 text-sm font-medium leading-relaxed">{{ n.mensaje }}</p>
            
            <div class="mt-3 flex gap-2" *ngIf="!n.leido">
              <button (click)="marcarLeida(n.id)" class="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                Marcar como leída
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="notificaciones.length === 0" class="py-20 text-center bg-white rounded-[3rem] border border-slate-100">
          <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="bi bi-bell-slash text-slate-200 text-4xl"></i>
          </div>
          <h3 class="text-xl font-black text-slate-800 italic">No hay notificaciones</h3>
          <p class="text-slate-400 font-medium">Te avisaremos cuando ocurra algo importante.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-in {
      animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NotificacionesFullComponent implements OnInit {
  private notifService = inject(NotificacionesService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  notificaciones: any[] = [];

  ngOnInit() {
    this.cargarNotificaciones();
  }

  cargarNotificaciones() {
    const userId = this.authService.currentUser?.id;
    if (userId) {
      this.notifService.conectarWebSocket(userId);
      this.notifService.cargarHistorial();
    }

    this.notifService.getNotificaciones().subscribe(res => {
      this.notificaciones = res;
      this.cdr.detectChanges();
    });
  }

  marcarLeida(id: number) {
    this.notifService.marcarLeida(id).subscribe(() => {
      // La lista se actualiza automáticamente porque el servicio emite el nuevo estado
    });
  }
}
