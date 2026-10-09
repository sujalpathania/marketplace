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

          <!-- Student ID Photo Upload -->
          <div class="form-group">
            <label>Student ID Card Photo <span class="req-badge">Required</span></label>
            <div class="upload-zone" [class.has-file]="photoPreview" (click)="photoInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
              <input #photoInput type="file" id="studentIdPhoto" name="studentIdPhoto" accept="image/*"
                (change)="onPhotoSelected($event)" style="display:none" />

              <div *ngIf="!photoPreview" class="upload-placeholder">
                <span class="upload-icon">🪪</span>
                <p class="upload-label">Click or drag & drop your ID card photo</p>
                <p class="upload-hint">JPG, PNG or WEBP · Max 5MB</p>
              </div>

              <div *ngIf="photoPreview" class="photo-preview-wrap">
                <img [src]="photoPreview" alt="ID Preview" class="photo-preview" />
                <div class="photo-overlay">
                  <span class="photo-change">📷 Change Photo</span>
                </div>
              </div>
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

          <!-- Verification Note -->
          <div class="verify-note">
            <span>🔒</span>
            <span>Your ID photo is used for student verification only and kept secure.</span>
          </div>

          <button type="submit" id="register-submit"
            [disabled]="registerForm.invalid || !studentIdPhotoFile || loading"
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

    /* ── Upload Zone ── */
    .upload-zone {
      border: 2px dashed rgba(99,102,241,0.3);
      border-radius: 12px;
      background: rgba(9,13,26,0.5);
      cursor: pointer;
      transition: all 0.25s;
      overflow: hidden;
      min-height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .upload-zone:hover {
      border-color: rgba(99,102,241,0.65);
      background: rgba(99,102,241,0.06);
    }
    .upload-zone.has-file { border-style: solid; border-color: rgba(99,102,241,0.4); }
    .upload-placeholder {
      text-align: center;
      padding: 1.5rem 1rem;
      pointer-events: none;
    }
    .upload-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    .upload-label { color: #94a3b8; font-size: 0.88rem; font-weight: 600; margin: 0 0 0.25rem; }
    .upload-hint { color: #475569; font-size: 0.75rem; margin: 0; }

    .photo-preview-wrap {
      position: relative;
      width: 100%;
      height: 150px;
    }
    .photo-preview {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }
    .photo-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .upload-zone:hover .photo-overlay { opacity: 1; }
    .photo-change {
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      background: rgba(99,102,241,0.8);
      padding: 0.5rem 1rem;
      border-radius: 999px;
    }

    /* Verification note */
    .verify-note {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      color: #94a3b8;
      font-size: 0.8rem;
      line-height: 1.5;
    }

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
  studentIdPhotoFile: File | null = null;
  photoPreview: string | null = null;
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.setPhoto(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.setPhoto(file);
    }
  }

  private setPhoto(file: File): void {
    this.studentIdPhotoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.photoPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (!this.fullName || !this.email || !this.password || !this.studentId || !this.collegeName) return;
    if (!this.studentIdPhotoFile) {
      this.error = 'Please upload a photo of your student ID card.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      studentId: this.studentId,
      collegeName: this.collegeName,
      studentIdPhoto: this.studentIdPhotoFile
    }).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/listings']); },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
