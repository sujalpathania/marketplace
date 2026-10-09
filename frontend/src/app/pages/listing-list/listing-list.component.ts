import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../models/listing.model';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="marketplace-container">

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-badge">🏫 Student-to-Student</div>
        <h1 class="hero-title">
          Buy &amp; Sell on Campus
          <span class="title-emoji">📚</span>
        </h1>
        <p class="hero-subtitle">The official marketplace for textbooks, tech, dorm essentials &amp; more — all from fellow students.</p>

        <!-- Search Bar -->
        <div class="search-wrapper">
          <div class="search-bar">
            <span class="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              placeholder="Search textbooks, laptops, dorm items..."
              class="search-input"
              id="search-listings"
            />
            <button (click)="loadListings()" class="search-btn">Search</button>
          </div>
        </div>
      </section>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-chip">📦 {{ listings.length }} Items Listed</div>
        <div class="stat-chip">🏷️ {{ getAvailableCount() }} Available</div>
        <div class="stat-chip">📂 5 Categories</div>
      </div>

      <!-- Category Chips -->
      <div class="category-chips">
        <button
          *ngFor="let cat of categories"
          (click)="selectCategory(cat)"
          [class.active]="selectedCategory === cat"
          class="chip-btn"
          [id]="'cat-' + cat"
        >
          <span>{{ getCategoryEmoji(cat) }}</span>
          {{ cat }}
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="state-container">
        <div class="loader-ring">
          <div></div><div></div><div></div><div></div>
        </div>
        <p>Fetching campus listings...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="alert error-alert">
        <span>⚠️</span> {{ error }}
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && listings.length === 0 && !error" class="state-container empty-state">
        <div class="empty-icon-wrap">📦</div>
        <h3>No Available Items Found</h3>
        <p>Be the first to sell something in this category!</p>
        <a routerLink="/sell" class="cta-btn" id="sell-first-item">+ Post Your First Listing</a>
      </div>

      <!-- Listings Grid -->
      <div *ngIf="!loading && listings.length > 0" class="listings-grid">
        <div *ngFor="let item of listings; let i = index" class="item-card" [style.animation-delay]="(i * 60) + 'ms'">
          <div class="card-image-container">
            <img [src]="getImageUrl(item.imageUrl)" [alt]="item.title" class="card-img" loading="lazy" />
            <div class="card-badges">
              <span class="badge condition-badge">{{ item.condition }}</span>
              <span class="badge category-badge">{{ item.category }}</span>
            </div>
            <div class="card-overlay">
              <a [routerLink]="['/listings', item.id]" class="overlay-btn" [id]="'view-' + item.id">Quick View →</a>
            </div>
          </div>

          <div class="card-body">
            <div class="card-price-row">
              <span class="card-price">₹{{ item.price | number:'1.2-2' }}</span>
              <span class="item-status" [class.sold]="item.status === 'Sold'">{{ item.status }}</span>
            </div>
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-desc">{{ item.description | slice:0:85 }}{{ item.description.length > 85 ? '…' : '' }}</p>

            <div class="card-footer">
              <div class="seller-info">
                <div class="seller-avatar">{{ (item.seller?.fullName || 'C')[0].toUpperCase() }}</div>
                <span>{{ item.seller?.fullName || 'Campus Seller' }}</span>
              </div>
              <a [routerLink]="['/listings', item.id]" class="view-btn" [id]="'details-' + item.id">
                Details <span class="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .marketplace-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2.5rem 2rem 4rem;
      position: relative;
      z-index: 1;
    }

    /* Hero */
    .hero-section {
      text-align: center;
      margin-bottom: 2.5rem;
      animation: fadeInUp 0.5s ease both;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .hero-badge {
      display: inline-block;
      background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(217,70,239,0.2));
      border: 1px solid rgba(99,102,241,0.35);
      color: #c4b5fd;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.35rem 1rem;
      border-radius: 999px;
      letter-spacing: 0.5px;
      margin-bottom: 1.2rem;
    }
    .hero-title {
      font-size: clamp(2.2rem, 5vw, 3.2rem);
      font-weight: 900;
      color: #fff;
      margin-bottom: 0.75rem;
      letter-spacing: -1px;
      line-height: 1.1;
    }
    .title-emoji { margin-left: 0.3rem; }
    .hero-subtitle {
      color: #94a3b8;
      font-size: 1.05rem;
      max-width: 580px;
      margin: 0 auto 2rem;
      line-height: 1.6;
    }

    /* Search */
    .search-wrapper { max-width: 660px; margin: 0 auto; }
    .search-bar {
      display: flex;
      align-items: center;
      background: rgba(22, 31, 55, 0.85);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 0.4rem 0.4rem 0.4rem 1rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .search-bar:focus-within {
      border-color: rgba(99,102,241,0.5);
      box-shadow: 0 8px 32px rgba(99,102,241,0.2);
    }
    .search-icon { color: #64748b; display: flex; align-items: center; }
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 0.7rem 0.75rem;
      color: #fff;
      font-size: 0.98rem;
      font-family: inherit;
    }
    .search-input::placeholder { color: #475569; }
    .search-input:focus { outline: none; }
    .search-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border: none;
      padding: 0.7rem 1.6rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .search-btn:hover {
      background: linear-gradient(135deg, #818cf8, #a78bfa);
      box-shadow: 0 4px 16px rgba(99,102,241,0.4);
    }

    /* Stats */
    .stats-row {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
    }
    .stat-chip {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: #94a3b8;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.4rem 1rem;
      border-radius: 999px;
    }

    /* Category Chips */
    .category-chips {
      display: flex;
      gap: 0.6rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }
    .chip-btn {
      background: rgba(22, 31, 55, 0.7);
      border: 1px solid rgba(255,255,255,0.08);
      color: #94a3b8;
      padding: 0.5rem 1.2rem;
      border-radius: 999px;
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 600;
      font-family: inherit;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .chip-btn:hover {
      background: rgba(99,102,241,0.15);
      border-color: rgba(99,102,241,0.4);
      color: #c4b5fd;
    }
    .chip-btn.active {
      background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.35));
      border-color: #6366f1;
      color: #c4b5fd;
      box-shadow: 0 0 14px rgba(99,102,241,0.2);
    }

    /* Grid */
    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 1.75rem;
    }

    /* Card */
    .item-card {
      background: rgba(18, 26, 48, 0.75);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 18px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      animation: fadeInUp 0.45s ease both;
    }
    .item-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.25);
      border-color: rgba(99,102,241,0.3);
    }
    .card-image-container {
      position: relative;
      height: 210px;
      background: #0a1020;
      overflow: hidden;
    }
    .card-img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .item-card:hover .card-img { transform: scale(1.05); }

    .card-badges {
      position: absolute;
      top: 10px; left: 10px;
      display: flex;
      gap: 0.4rem;
    }
    .badge {
      padding: 0.28rem 0.6rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      backdrop-filter: blur(6px);
    }
    .condition-badge {
      background: rgba(15, 23, 42, 0.85);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .category-badge {
      background: rgba(99, 102, 241, 0.8);
      color: #fff;
    }

    /* Hover overlay */
    .card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(6, 9, 19, 0.7), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 1.25rem;
    }
    .item-card:hover .card-overlay { opacity: 1; }
    .overlay-btn {
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      padding: 0.5rem 1.5rem;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    .overlay-btn:hover { background: rgba(255,255,255,0.2); }

    /* Card Body */
    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .card-price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.4rem;
    }
    .card-price {
      font-size: 1.5rem;
      font-weight: 900;
      color: #34d399;
      letter-spacing: -0.5px;
    }
    .item-status {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: rgba(52, 211, 153, 0.15);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
      text-transform: uppercase;
    }
    .item-status.sold {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 0.5rem 0;
      line-height: 1.35;
    }
    .card-desc {
      color: #64748b;
      font-size: 0.85rem;
      line-height: 1.5;
      margin-bottom: 1.2rem;
      flex: 1;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.85rem;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .seller-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: #94a3b8;
    }
    .seller-avatar {
      width: 24px; height: 24px;
      background: linear-gradient(135deg, #6366f1, #d946ef);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }
    .view-btn {
      color: #818cf8;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: color 0.2s;
    }
    .view-btn .arrow { transition: transform 0.2s; }
    .view-btn:hover { color: #c4b5fd; }
    .view-btn:hover .arrow { transform: translateX(3px); }

    /* States */
    .state-container {
      text-align: center;
      padding: 5rem 1rem;
      color: #64748b;
    }
    .loader-ring {
      display: inline-block;
      position: relative;
      width: 48px; height: 48px;
      margin-bottom: 1.2rem;
    }
    .loader-ring div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 38px; height: 38px;
      margin: 5px;
      border: 4px solid transparent;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: ring 1.1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .loader-ring div:nth-child(1) { animation-delay: -0.45s; }
    .loader-ring div:nth-child(2) { animation-delay: -0.3s; border-top-color: #8b5cf6; }
    .loader-ring div:nth-child(3) { animation-delay: -0.15s; border-top-color: #d946ef; }
    @keyframes ring {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .empty-icon-wrap {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      display: block;
      filter: grayscale(0.3);
    }
    .empty-state h3 {
      color: #cbd5e1;
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .empty-state p { margin-bottom: 1.5rem; }
    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      padding: 0.75rem 1.75rem;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 6px 20px rgba(99,102,241,0.4);
      transition: all 0.25s;
    }
    .cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(99,102,241,0.55);
    }
    .alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }
    .error-alert {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
  `]
})
export class ListingListComponent implements OnInit {
  listings: Listing[] = [];
  categories: string[] = ['All', 'Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Other'];
  selectedCategory = 'All';
  searchQuery = '';
  loading = true;
  error = '';

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading = true;
    this.error = '';
    this.listingService.getListings(this.searchQuery, this.selectedCategory).subscribe({
      next: (data) => { this.listings = data; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Failed to load campus listings. Make sure the backend server is running.'; }
    });
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.loadListings();
  }

  onSearchChange(): void { this.loadListings(); }

  getAvailableCount(): number {
    return this.listings.filter(l => l.status === 'Available').length;
  }

  getCategoryEmoji(cat: string): string {
    const map: Record<string, string> = {
      'All': '🌐', 'Textbooks': '📚', 'Electronics': '💻', 'Furniture': '🪑', 'Clothing': '👕', 'Other': '📦'
    };
    return map[cat] ?? '📦';
  }

  getImageUrl(url?: string): string {
    if (!url) return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  }
}
