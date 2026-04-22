import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class TalleresService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/talleres`;

  getTalleres() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTaller(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crearTaller(taller: any) {
    return this.http.post<any>(this.apiUrl, taller);
  }

  actualizarTaller(id: number, taller: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, taller);
  }

  eliminarTaller(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
