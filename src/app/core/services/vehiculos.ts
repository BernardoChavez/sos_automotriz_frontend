import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vehiculos/`; 

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearVehiculo(vehiculo: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, vehiculo);
  }

  updateVehiculo(id: number, vehiculo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}`, vehiculo);
  }

  deleteVehiculo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}`);
  }
}