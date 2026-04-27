import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class IncidentesService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getMisSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/incidentes/cliente/mis-solicitudes`);
  }

  solicitarEmergencia(data: { vehiculo_id: number, latitud: number, longitud: number }): Observable<any> {
    const params = `vehiculo_id=${data.vehiculo_id}&latitud=${data.latitud}&longitud=${data.longitud}`;
    return this.http.post<any>(`${this.baseUrl}/incidentes/solicitar/?${params}`, {});
  }

  subirEvidencia(incidenteId: string, tipo: 'foto' | 'audio', file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/incidentes/${incidenteId}/evidencias/?tipo=${tipo}`, formData);
  }

  getMisTrabajosTecnico(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/incidentes/tecnico/mis-trabajos`);
  }

  getSolicitudesTaller(tallerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/incidentes/taller/${tallerId}/solicitudes`);
  }

  gestionarIncidente(incidenteId: string, accion: 'aceptar' | 'rechazar', tecnicoId?: number): Observable<any> {
    let url = `${this.baseUrl}/incidentes/${incidenteId}/gestionar/?accion=${accion}`;
    if (tecnicoId) url += `&tecnico_id=${tecnicoId}`;
    return this.http.patch<any>(url, {});
  }

  // --- CICLO 3: GESTIÓN, PAGOS Y RESEÑAS ---
  actualizarEstadoGestion(id: string, estado: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/gestion/bitacora/${id}?estado_nuevo=${estado}`, {});
  }

  procesarPago(id: string, metodo: string, monto: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/gestion/pagos/${id}?metodo=${metodo}&monto=${monto}`, {});
  }

  dejarResena(id: string, calificacion: number, comentario: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/gestion/resenas/${id}?calificacion=${calificacion}&comentario=${comentario}`, {});
  }

  // Alias para compatibilidad con componentes viejos
  calificarServicio(id: string, calificacion: number, comentario: string): Observable<any> {
    return this.dejarResena(id, calificacion, comentario);
  }

  getRastreo(incidenteId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/incidentes/${incidenteId}/rastreo/`);
  }

  finalizarServicio(incidenteId: string, diagnostico: string, monto: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/incidentes/${incidenteId}/finalizar?diagnostico=${diagnostico}&monto=${monto}`, {});
  }

  empezarReparacion(incidenteId: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/incidentes/${incidenteId}/reparar`, {});
  }

  getReportePDF(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/gestion/reporte-pdf/${id}`);
  }
}
