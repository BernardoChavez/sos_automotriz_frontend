import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {
  private authService = inject(AuthService);
  private socket?: WebSocket;

  constructor() {
    // Solicitar permiso para notificaciones nativas del navegador al iniciar
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  conectar() {
    const user = this.authService.currentUser;
    if (!user || this.socket) return;

    // Convertir http:// a ws:// para el socket
    const wsUrl = environment.apiUrl.replace('http', 'ws') + `/ws/${user.id}`;
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.tipo === 'notificacion') {
        this.mostrarNotificacionNativa(data.titulo, data.mensaje);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket cerrado. Reintentando en 5s...");
      this.socket = undefined;
      setTimeout(() => this.conectar(), 5000);
    };
  }

  private mostrarNotificacionNativa(titulo: string, mensaje: string) {
    // 1. Notificación Nativa del Sistema Operativo (REAL)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, {
        body: mensaje,
        icon: '/assets/icons/icon-72x72.png' // Asegúrate de que exista o quítalo
      });
    }

    // 2. Opcional: Reproducir un sonido de alerta
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.play().catch(e => console.log("Audio block by browser"));
  }
}
