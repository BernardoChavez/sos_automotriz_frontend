import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/permisos`;

  getMatriz() {
    return this.http.get<any[]>(`${this.apiUrl}/matriz`);
  }

  togglePermiso(rol: string, permisoId: number) {
    return this.http.post<any>(`${this.apiUrl}/sincronizar?rol=${rol}&permiso_id=${permisoId}`, {});
  }
}
