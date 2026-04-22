import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private http = inject(HttpClient);
  // IP fija y slash final para evitar errores 404 y 307
  private apiUrl = 'http://127.0.0.1:8000/vehiculos/'; 

  getVehiculos(): Observable<any[]> {
    console.log('Solicitando vehículos...');
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.table('Vehículos recibidos:', data))
    );
  }

  crearVehiculo(vehiculo: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, vehiculo);
  }
}