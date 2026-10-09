import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  currentUser = signal<User | null>(this.getUserFromStorage());
  token = signal<string | null>(localStorage.getItem('token'));

  constructor(private http: HttpClient) {}

  register(userData: {
    fullName: string;
    email: string;
    password: string;
    studentId: string;
    collegeName: string;
    studentIdPhoto: File;
  }): Observable<AuthResponse> {
    const form = new FormData();
    form.append('fullName', userData.fullName);
    form.append('email', userData.email);
    form.append('password', userData.password);
    form.append('studentId', userData.studentId);
    form.append('collegeName', userData.collegeName);
    form.append('studentIdPhoto', userData.studentIdPhoto);

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, form).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  getToken(): string | null { return localStorage.getItem('token'); }
  isLoggedIn(): boolean { return !!this.getToken(); }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.token.set(res.token);
    this.currentUser.set(res.user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try { return JSON.parse(userStr); } catch { return null; }
  }
}
