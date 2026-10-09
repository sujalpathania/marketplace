import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <div class="auth-brand">
          <span class="auth-brand-icon">🎓</span>
        </div>
        <div class="auth-header">
          <h2>Create Student Account</h2>
          <p>Join your campus marketplace — verified students only</p>
        </div>

        <div *ngIf="error" class="alert error-alert">
          <span>⚠️</span> {{ error }}
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">

          <!-- Full Name -->
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input type="text" id="fullName" name="fullName" [(ngModel)]="fullName" required
                placeholder="Your full name" class="form-control" autocomplete="name" />
            </div>
          </div>

          <!-- Email -->
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

          <!-- College Name -->
          <div class="form-group">
            <label for="collegeName">College / University Name</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </span>
              <input type="text" id="collegeName" name="collegeName" [(ngModel)]="collegeName" required
                placeholder="e.g. IIT Delhi, VIT Vellore..." class="form-control" />
            </div>
          </div>

          <!-- Student ID -->
          <div class="form-group">
            <label for="studentId">Student ID Number</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
              <input type="text" id="studentId" name="studentId" [(ngModel)]="studentId" required
                placeholder="e.g. 2023CSE0101" class="form-control" />
            </div>
          </div>



          <!-- Password -->
          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input type="password" id="password" name="password" [(ngModel)]="password" required minlength="6"
                placeholder="Min 6 characters" class="form-control" autocomplete="new-password" />
            </div>
          </div>



          <button type="submit" id="register-submit"
            [disabled]="registerForm.invalid || loading"
            class="submit-btn">
            
            <span *ngIf="!loading">Create Verified Account →</span>
            <span *ngIf="loading">Creating Account...</span>
          </button>

          <p class="terms-text">By creating an account you agree to our terms of service.</p>
        </form>

        <div class="divider">OR</div>
        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign in →</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: calc(100vh - 80px);
      padding: 2rem 1rem;
      position: relative;
      z-index: 1;
    }
    .auth-card {
      background: rgba(14, 20, 40, 0.78);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 22px;
      padding: 2.5rem;
      width: 100%;
      max-width: 500px;
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
      animation: slideUp 0.4s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .auth-brand { text-align: center; margin-bottom: 1rem; }
    .auth-brand-icon { font-size: 2.2rem; }
    .auth-header { text-align: center; margin-bottom: 1.75rem; }
    .auth-header h2 {
      color: #fff; font-size: 1.7rem; font-weight: 800;
      letter-spacing: -0.5px; margin: 0 0 0.35rem;
    }
    .auth-header p { color: #64748b; font-size: 0.88rem; margin: 0; }

    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #94a3b8;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.4rem;
    }
    .req-badge {
      background: rgba(239,68,68,0.15);
      border: 1px solid rgba(239,68,68,0.3);
      color: #f87171;
      font-size: 0.68rem;
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
      text-transform: none;
      font-weight: 700;
      letter-spacing: 0;
    }

    .input-wrap { position: relative; }
    .input-icon {
      position: absolute;
      left: 0.85rem; top: 50%;
      transform: translateY(-50%);
      color: #475569;
      display: flex; align-items: center;
      pointer-events: none;
    }
    .form-control {
      width: 100%;
      padding: 0.78rem 1rem 0.78rem 2.6rem;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(9,13,26,0.7);
      color: #fff;
      font-size: 0.92rem;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .form-control:focus {
      outline: none;
      border-color: rgba(99,102,241,0.65);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
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
      font-size: 0.95rem;
      font-family: inherit;
      cursor: pointer;
      margin-top: 0.25rem;
      transition: all 0.25s;
      box-shadow: 0 6px 22px rgba(99,102,241,0.4);
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 32px rgba(99,102,241,0.55);
      background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
    }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .terms-text { font-size: 0.75rem; color: #475569; text-align: center; margin-top: 0.75rem; }

    .divider {
      display: flex; align-items: center;
      gap: 0.75rem; margin: 1.25rem 0;
      color: #334155; font-size: 0.8rem;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1; height: 1px;
      background: rgba(255,255,255,0.06);
    }
    .auth-footer { text-align: center; color: #475569; font-size: 0.9rem; }
    .auth-footer a { color: #818cf8; text-decoration: none; font-weight: 700; }
    .auth-footer a:hover { color: #c4b5fd; }

    .alert {
      padding: 0.85rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.25rem;
      font-size: 0.9rem;
      display: flex; align-items: flex-start; gap: 0.5rem;
    }
    .error-alert {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      color: #fca5a5;
    }
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  collegeName = '';
  studentId = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.fullName || !this.email || !this.password || !this.studentId || !this.collegeName) return;


    this.loading = true;
    this.error = '';

    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      studentId: this.studentId,
      collegeName: this.collegeName
    }).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/listings']); },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
