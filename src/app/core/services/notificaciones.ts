import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notificaciones`;
  private wsUrl = environment.apiUrl.replace('http', 'ws').replace('/api/v1', '');
  
  private socket: WebSocket | null = null;
  private notificacionesSubject = new BehaviorSubject<any[]>([]);

  constructor() {
    // Ya no cargamos el historial automáticamente al iniciar para evitar fallos de token
  }

  public cargarHistorial(): void {
    if (!localStorage.getItem('access_token')) return;

    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res: any[]) => {
        const formateadas = res.map((n: any) => ({
          id: n.id,
          titulo: n.titulo,
          mensaje: n.mensaje,
          leido: n.leido,
          fecha: n.fecha,
          icono: n.titulo.toLowerCase().includes('pago') ? 'bi-cash-coin text-green-500' : 'bi-bell-fill text-blue-500',
          bg: n.leido ? 'bg-white' : 'bg-slate-50'
        }));
        this.notificacionesSubject.next(formateadas);
      },
      error: (err: any) => console.error('Error cargando historial de notificaciones:', err)
    });
  }

  conectarWebSocket(userId: number): void {
    if (this.socket) {
      this.socket.close();
    }
    
    this.socket = new WebSocket(`${this.wsUrl}/ws/notificaciones/${userId}`);
    
    this.socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const actuales = this.notificacionesSubject.value;
      
      const nuevaNotif = {
        id: Date.now(),
        titulo: data.titulo || (data.type === 'pago_completado' ? 'Pago Confirmado' : 
                data.type === 'asignacion' ? 'Nuevo Auxilio Asignado' : 'Notificación'),
        mensaje: data.mensaje || (data.type === 'pago_completado' ? `Se ha confirmado un pago de Bs. ${data.monto}` : 
                 data.type === 'asignacion' ? `Te han asignado una emergencia` : JSON.stringify(data)),
        tiempo: 'Hace un momento',
        icono: (data.titulo?.toLowerCase().includes('pago') || data.type === 'pago_completado') ? 'bi-cash-coin text-green-500' : 'bi-bell-fill text-blue-500',
        bg: 'bg-slate-50'
      };

      this.notificacionesSubject.next([nuevaNotif, ...actuales]);
      this.lanzarNotificacionNativa(nuevaNotif.titulo, nuevaNotif.mensaje);
    };

    this.socket.onclose = () => {
      console.log('WebSocket desconectado. Intentando reconectar en 5s...');
      setTimeout(() => this.conectarWebSocket(userId), 5000);
    };
  }

  getNotificaciones(): Observable<any[]> {
    return this.notificacionesSubject.asObservable();
  }

  private lanzarNotificacionNativa(titulo: string, mensaje: string): void {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.play().catch(() => {});

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(titulo, { body: mensaje, icon: 'assets/icons/icon-128x128.png' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(titulo, { body: mensaje });
          }
        });
      }
    }
  }

  marcarLeida(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/leer`, {}).pipe(
      tap(() => {
        const actuales = this.notificacionesSubject.value.map((n: any) => {
          if (n.id === id) {
            return { ...n, leido: true, bg: 'bg-white' };
          }
          return n;
        });
        this.notificacionesSubject.next(actuales);
      })
    );
  }
}
