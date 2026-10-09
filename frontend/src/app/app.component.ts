import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <footer class="app-footer">
        <div class="footer-inner">
          <span class="footer-brand">🎓 CampusMarket</span>
          <span class="footer-sep">·</span>
          <span>Student-to-Student Marketplace</span>
          <span class="footer-sep">·</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #090d16;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
    }
    .main-content { flex: 1; }
    .app-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 1.5rem 2rem;
      text-align: center;
      background: rgba(9, 13, 22, 0.8);
      backdrop-filter: blur(12px);
    }
    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: #475569;
      font-size: 0.85rem;
    }
    .footer-brand {
      font-weight: 700;
      color: #64748b;
    }
    .footer-sep { color: #334155; }
  `]
})
export class AppComponent {
  title = 'Campus Marketplace';
}
