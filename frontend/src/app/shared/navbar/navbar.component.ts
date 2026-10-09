import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="brand">
          <span class="brand-icon">🎓</span>
          <span class="brand-text">Campus<span class="highlight">Market</span></span>
        </a>

        <div class="nav-links">
          <a routerLink="/listings" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            Explore Items
          </a>

          <ng-container *ngIf="authService.currentUser(); else guestLinks">
            <a routerLink="/sell" routerLinkActive="active" class="nav-btn primary-btn">
              <span class="plus-icon">+</span> Sell an Item
            </a>
            <a routerLink="/my-orders" routerLinkActive="active" class="nav-link">
              My Orders & Sales
            </a>
            <div class="user-menu">
              <div class="user-avatar">{{ getUserInitial() }}</div>
              <span class="user-greeting">{{ authService.currentUser()?.fullName }}</span>
              <button (click)="logout()" class="logout-btn" title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </ng-container>

          <ng-template #guestLinks>
            <a routerLink="/login" routerLinkActive="active" class="nav-link">Log In</a>
            <a routerLink="/register" class="nav-btn outline-btn">Register</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: rgba(9, 13, 22, 0.82);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 30px rgba(0,0,0,0.45);
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 2rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .brand-icon {
      font-size: 1.7rem;
      animation: floatIcon 3s ease-in-out infinite alternate;
    }
    @keyframes floatIcon {
      from { transform: translateY(0px); }
      to   { transform: translateY(-4px); }
    }
    .brand-text { color: #fff; }
    .highlight {
      background: linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #d946ef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-link {
      color: #94a3b8;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      position: relative;
      padding-bottom: 2px;
      transition: color 0.25s;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -3px; left: 0;
      width: 0; height: 2px;
      background: linear-gradient(90deg, #6366f1, #d946ef);
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    .nav-link:hover, .nav-link.active { color: #c4b5fd; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }

    .nav-btn {
      padding: 0.55rem 1.25rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .primary-btn {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      box-shadow: 0 4px 20px rgba(99,102,241,0.45);
    }
    .primary-btn:hover {
      transform: translateY(-2px);
      background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
      box-shadow: 0 8px 30px rgba(99,102,241,0.6);
    }
    .plus-icon { font-size: 1.1rem; line-height: 1; }
    .outline-btn {
      border: 1.5px solid rgba(99,102,241,0.5);
      color: #a5b4fc;
      background: rgba(99,102,241,0.06);
    }
    .outline-btn:hover {
      background: rgba(99,102,241,0.15);
      border-color: #6366f1;
      color: #c4b5fd;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 0.35rem 0.85rem 0.35rem 0.4rem;
      border-radius: 999px;
    }
    .user-avatar {
      width: 29px; height: 29px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #d946ef);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }
    .user-greeting {
      font-size: 0.875rem;
      color: #e2e8f0;
      white-space: nowrap;
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .logout-btn {
      background: transparent;
      border: none;
      color: #f87171;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 3px;
      border-radius: 5px;
      transition: color 0.2s, background 0.2s;
    }
    .logout-btn:hover {
      color: #ef4444;
      background: rgba(239,68,68,0.1);
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitial(): string {
    return this.authService.currentUser()?.fullName?.charAt(0)?.toUpperCase() || '?';
  }
}
