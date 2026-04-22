import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class TecnicosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tecnicos`;

  getTecnicos(tallerId?: number) {
    const url = tallerId 
      ? `${environment.apiUrl}/usuarios/taller/${tallerId}/tecnicos`
      : `${environment.apiUrl}/tecnicos/`;
    
    console.log('Solicitando técnicos desde:', url);
    return this.http.get<any[]>(url).pipe(
      tap(data => console.table(data))
    );
  }

  crearTecnico(tecnico: any) {
    return this.http.post<any>(this.apiUrl, tecnico);
  }

  toggleDisponibilidad(id: number, disponible: boolean) {
    return this.http.patch<any>(`${this.apiUrl}/${id}/disponibilidad?disponible=${disponible}`, {});
  }

  eliminarTecnico(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
