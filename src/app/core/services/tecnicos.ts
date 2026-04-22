import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TecnicosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/tecnicos';

  // --- VISTA TÉCNICO ---
  getMiPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  updateMiPerfil(data: any): Observable<any> {
    console.log('Actualizando perfil técnico:', data);
    return this.http.put(`${this.apiUrl}/perfil`, data);
  }

  // --- VISTA ADMIN ---
  getTecnicos(tallerId?: number): Observable<any[]> {
    const url = tallerId ? `http://localhost:8000/usuarios/taller/${tallerId}/tecnicos` : this.apiUrl;
    return this.http.get<any[]>(url);
  }

  toggleDisponibilidad(usuarioId: number, disponible: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${usuarioId}/disponibilidad?disponible=${disponible}`, {});
  }
}
