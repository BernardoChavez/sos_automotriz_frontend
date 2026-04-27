import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      try {
        this.userSubject.next(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user_data');
        localStorage.removeItem('access_token');
      }
    }
  }

  login(credentials: any) {
    const body = new HttpParams()
      .set('username', credentials.email)
      .set('password', credentials.password);
  
    return this.http.post<any>(`${this.apiUrl}/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user_data', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  recoverPassword(email: string) {
    return this.http.post(`${this.apiUrl}/recover-password`, { email }).pipe(
      tap(() => console.log('Respuesta de recuperación recibida del servidor'))
    );
  }

  verifyCode(email: string, code: string) {
    return this.http.post(`${this.apiUrl}/verify-code`, { email, code });
  }

  resetPassword(data: { email: string, code: string, new_password: string }) {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout() // Cerrar igual si hay error
    });
  }

  private finishLogout() {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  updateStoredUser(user: any) {
    const updated = { ...this.currentUser, ...user };
    localStorage.setItem('user_data', JSON.stringify(updated));
    this.userSubject.next(updated);
  }

  refreshUser() {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        localStorage.setItem('user_data', JSON.stringify(user));
        this.userSubject.next(user);
      })
    ).subscribe();
  }

  get currentUser() {
    return this.userSubject.value;
  }

  hasPermission(permiso: string): boolean {
    if (this.currentUser?.rol === 'super_admin') return true;
    return this.currentUser?.permisos?.includes(permiso) || false;
  }
}