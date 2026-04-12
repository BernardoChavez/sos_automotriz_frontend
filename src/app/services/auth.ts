import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService { // <--- DEBE DECIR AuthService
  private API_URL = 'http://127.0.0.1:8000/usuarios';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    return this.http.post(`${this.API_URL}/login`, formData).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user_info));
      })
    );
  }
}