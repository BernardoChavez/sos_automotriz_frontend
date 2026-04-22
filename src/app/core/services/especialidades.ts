import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/especialidades`;

  getEspecialidades() {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearEspecialidad(nombre: string) {
    return this.http.post<any>(this.apiUrl, { nombre_especialidad: nombre });
  }
}
