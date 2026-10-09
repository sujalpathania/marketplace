import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const AUTH_STYLES = [`
  .auth-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 80px);
    padding: 2rem 1rem;
    position: relative;
    z-index: 1;
  }
  .auth-card {
    background: rgba(14, 20, 40, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 22px;
    padding: 2.5rem;
    width: 100%;
    max-width: 460px;
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.04);
    animation: slideUp 0.45s ease;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .auth-brand {
    text-align: center;
    margin-bottom: 1.75rem;
  }
  .auth-brand-icon {
    font-size: 2.2rem;
    display: block;
    margin-bottom: 0.5rem;
  }
  .auth-header h2 {
    margin: 0 0 0.4rem 0;
    color: #fff;
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-align: center;
  }
  .auth-header p {
    color: #64748b;
    margin: 0 0 1.75rem 0;
    font-size: 0.92rem;
    text-align: center;
  }
  .form-group {
    margin-bottom: 1.1rem;
    position: relative;
  }
  .form-group label {
    display: block;
    color: #94a3b8;
    font-size: 0.82rem;
    font-weight: 600;
    margin-bottom: 0.45rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .input-wrap {
    position: relative;
  }
  .input-icon {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
    display: flex;
    align-items: center;
  }
  .form-control {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.6rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(9, 13, 26, 0.7);
    color: #fff;
    font-size: 0.95rem;
    font-family: inherit;
    box-sizing: border-box;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .form-control:focus {
    outline: none;
    border-color: rgba(99, 102, 241, 0.7);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
  .form-control::placeholder { color: #334155; }
  .submit-btn {
    width: 100%;
    padding: 0.9rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #fff;
    font-weight: 800;
    font-size: 0.98rem;
    font-family: inherit;
    cursor: pointer;
    margin-top: 0.75rem;
    transition: all 0.25s;
    box-shadow: 0 6px 22px rgba(99, 102, 241, 0.4);
    letter-spacing: 0.2px;
  }
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 32px rgba(99, 102, 241, 0.55);
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  }
  .submit-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1.5rem 0;
    color: #334155;
    font-size: 0.8rem;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
  }
  .auth-footer {
    margin-top: 1.5rem;
    text-align: center;
    color: #475569;
    font-size: 0.9rem;
  }
  .auth-footer a {
    color: #818cf8;
    text-decoration: none;
    font-weight: 700;
    transition: color 0.2s;
  }
  .auth-footer a:hover { color: #c4b5fd; }
  .alert {
    padding: 0.85rem 1rem;
    border-radius: 10px;
    margin-bottom: 1.25rem;
    font-size: 0.9rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .error-alert {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }
  .success-alert {
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.3);
    color: #6ee7b7;
  }
`];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <span class="auth-brand-icon">🎓</span>
        </div>
        <div class="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to buy and sell on your campus marketplace</p>
        </div>

        <div *ngIf="error" class="alert error-alert">
          <span>⚠️</span> {{ error }}
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Campus Email</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input type="email" id="email" name="email" [(ngModel)]="email" required email
                placeholder="student@university.edu" class="form-control" autocomplete="email" />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input type="password" id="password" name="password" [(ngModel)]="password" required
                placeholder="••••••••" class="form-control" autocomplete="current-password" />
            </div>
          </div>

          <button type="submit" id="login-submit" [disabled]="loginForm.invalid || loading" class="submit-btn">
            <span *ngIf="!loading">Sign In →</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </form>

        <div class="divider">OR</div>
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Create one →</a></p>
        </div>
      </div>
    </div>
  `,
  styles: AUTH_STYLES
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/listings']); },
      error: (err) => { this.loading = false; this.error = err.error?.error || 'Failed to login. Please check your credentials.'; }
    });
  }
}
