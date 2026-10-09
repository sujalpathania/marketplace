import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { PhotoRequestService, PhotoRequest } from '../../core/services/photo-request.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>My Orders & Sales 📊</h1>
        <p>Track your campus purchases and manage sales of your items</p>
      </div>

      <!-- Tab Switcher -->
      <div class="tabs">
        <button
          (click)="activeTab = 'sales'"
          [class.active]="activeTab === 'sales'"
          class="tab-btn"
        >
          My Sales (Items I Sold)
          <span class="badge-count" *ngIf="sales.length">{{ sales.length }}</span>
        </button>

        <button
          (click)="activeTab = 'purchases'"
          [class.active]="activeTab === 'purchases'"
          class="tab-btn"
        >
          My Purchases (Items I Bought)
          <span class="badge-count" *ngIf="purchases.length">{{ purchases.length }}</span>
        </button>

        <button
          (click)="activeTab = 'photo-requests'; loadPhotoRequests()"
          [class.active]="activeTab === 'photo-requests'"
          class="tab-btn"
        >
          📷 Photo Requests
          <span class="badge-count pending-badge" *ngIf="pendingPhotoCount">{{ pendingPhotoCount }}</span>
        </button>
      </div>

      <div *ngIf="loading" class="state-container">
        <div class="spinner"></div>
        <p>Loading your orders...</p>
      </div>

      <div *ngIf="error" class="alert error-alert">
        {{ error }}
      </div>

      <!-- TAB 1: MY SALES (Seller View) -->
      <div *ngIf="!loading && activeTab === 'sales'">
        <div *ngIf="sales.length === 0" class="empty-state">
          <span class="empty-icon">🤝</span>
          <h3>No Orders Received Yet</h3>
          <p>When another student orders your listed items, they will appear here!</p>
        </div>

        <div *ngIf="sales.length > 0" class="orders-list">
          <div *ngFor="let order of sales" class="order-card sales-card">
            <div class="order-img-wrapper">
              <img [src]="getImageUrl(order.listing?.imageUrl)" [alt]="order.listing?.title" class="order-img" />
            </div>

            <div class="order-details">
              <div class="status-tag confirmed">{{ order.status }}</div>
              <h3>{{ order.listing?.title }}</h3>
              <div class="price">₹{{ order.totalPrice | number:'1.2-2' }}</div>
              <div class="date">Ordered on: {{ order.createdAt | date:'medium' }}</div>

              <div class="party-info buyer-box">
                <h4>Buyer Details:</h4>
                <p>👤 <strong>Name:</strong> {{ order.buyer?.fullName }}</p>
                <p>✉️ <strong>Email:</strong> {{ order.buyer?.email }}</p>
                <p *ngIf="order.buyer?.studentId">🪪 <strong>Student ID:</strong> {{ order.buyer?.studentId }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: MY PURCHASES (Buyer View) -->
      <div *ngIf="!loading && activeTab === 'purchases'">
        <div *ngIf="purchases.length === 0" class="empty-state">
          <span class="empty-icon">🛍️</span>
          <h3>No Purchases Made Yet</h3>
          <p>Explore the campus marketplace and find textbooks, electronics, and dorm gear!</p>
          <a routerLink="/listings" class="explore-btn">Browse Marketplace</a>
        </div>

        <div *ngIf="purchases.length > 0" class="orders-list">
          <div *ngFor="let order of purchases" class="order-card purchases-card">
            <div class="order-img-wrapper">
              <img [src]="getImageUrl(order.listing?.imageUrl)" [alt]="order.listing?.title" class="order-img" />
            </div>

            <div class="order-details">
              <div class="status-tag confirmed">{{ order.status }}</div>
              <h3>{{ order.listing?.title }}</h3>
              <div class="price">₹{{ order.totalPrice | number:'1.2-2' }}</div>
              <div class="date">Purchased on: {{ order.createdAt | date:'medium' }}</div>

              <div class="party-info seller-box">
                <h4>Seller Details:</h4>
                <p>👤 <strong>Name:</strong> {{ order.seller?.fullName }}</p>
                <p>✉️ <strong>Email:</strong> {{ order.seller?.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: PHOTO REQUESTS -->
      <div *ngIf="!loading && activeTab === 'photo-requests'">
        <div *ngIf="photoRequests.length === 0" class="empty-state">
          <span class="empty-icon">📷</span>
          <h3>No Photo Requests</h3>
          <p>Incoming and outgoing photo requests will appear here.</p>
        </div>

        <div *ngIf="photoRequests.length > 0" class="orders-list">
          <div *ngFor="let req of photoRequests; let i = index" class="order-card photo-request-card">
            <div class="order-img-wrapper">
              <img [src]="getImageUrl(req.listingImage)" [alt]="req.listingTitle" class="order-img" />
              <div class="card-overlay" style="position: absolute; bottom: 0; width: 100%; text-align: center; background: rgba(0,0,0,0.6); padding: 4px;">
                <a [routerLink]="['/listings', req.listingId]" style="color: white; font-size: 0.8rem; text-decoration: none;">View Quick →</a>
              </div>
            </div>

            <div class="order-details">
              <div [class]="'status-tag ' + (req.status === 'Pending' ? 'pending' : 'confirmed')">{{ req.status }}</div>
              <div class="status-tag" style="background: rgba(99,102,241,0.2); color: #818cf8; margin-left: 0.5rem; border: 1px solid rgba(99,102,241,0.4);">
                {{ req.isSeller ? 'Incoming Request' : 'My Request (Outgoing)' }}
              </div>
              <h3>{{ req.listingTitle }}</h3>
              <div class="date">Requested on: {{ req.createdAt | date:'medium' }}</div>

              <div class="party-info buyer-box" *ngIf="req.isSeller">
                <h4>Buyer Details:</h4>
                <p>👤 <strong>Name:</strong> {{ req.buyerName }}</p>
                <p>✉️ <strong>Email:</strong> {{ req.buyerEmail }}</p>
              </div>

              <div class="request-message-box">
                <h4>💬 Request Message:</h4>
                <p>{{ req.message }}</p>
              </div>

              <!-- Upload Section (only for pending, and only for seller) -->
              <div *ngIf="req.status === 'Pending' && req.isSeller" class="upload-section">
                <label class="upload-label" [for]="'photo-upload-' + i">
                  📎 Choose Photos to Upload
                </label>
                <input
                  type="file"
                  [id]="'photo-upload-' + i"
                  accept="image/*"
                  multiple
                  (change)="onFilesSelected($event, i)"
                  class="file-input"
                />
                <div *ngIf="selectedFiles[i]?.length" class="selected-count">
                  {{ selectedFiles[i].length }} file(s) selected
                </div>
                <button
                  *ngIf="selectedFiles[i]?.length"
                  (click)="uploadPhotos(req.id, i)"
                  [disabled]="uploadingIndex === i"
                  class="upload-btn"
                >
                  <span *ngIf="uploadingIndex !== i">📤 Upload & Fulfill</span>
                  <span *ngIf="uploadingIndex === i">Uploading...</span>
                </button>
              </div>

              <div *ngIf="req.status === 'Fulfilled'" class="fulfilled-badge">
                ✅ Photos uploaded — request fulfilled.
              </div>

              <div *ngIf="uploadErrors[i]" class="alert error-alert upload-error">
                {{ uploadErrors[i] }}
              </div>
              <div *ngIf="uploadSuccess[i]" class="alert success-alert upload-success">
                {{ uploadSuccess[i] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    .dashboard-header h1 {
      font-size: 2rem;
      color: #fff;
      margin: 0 0 0.5rem 0;
    }
    .dashboard-header p {
      color: #94a3b8;
      margin: 0 0 2rem 0;
    }
    .tabs {
      display: flex;
      gap: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 2rem;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .tab-btn.active {
      color: #6366f1;
      border-bottom-color: #6366f1;
    }
    .badge-count {
      background: #6366f1;
      color: #fff;
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
    }
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .order-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
      backdrop-filter: blur(12px);
    }
    @media (max-width: 600px) {
      .order-card {
        flex-direction: column;
      }
    }
    .order-img-wrapper {
      width: 140px;
      height: 120px;
      background: #0f172a;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
    }
    .order-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .order-details {
      flex: 1;
    }
    .status-tag {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .status-tag.confirmed {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .order-details h3 {
      color: #fff;
      margin: 0 0 0.4rem 0;
      font-size: 1.15rem;
    }
    .price {
      font-size: 1.25rem;
      font-weight: 800;
      color: #34d399;
      margin-bottom: 0.25rem;
    }
    .date {
      color: #64748b;
      font-size: 0.82rem;
      margin-bottom: 1rem;
    }
    .party-info {
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
      padding: 0.75rem 1rem;
    }
    .party-info h4 {
      margin: 0 0 0.4rem 0;
      color: #cbd5e1;
      font-size: 0.85rem;
      text-transform: uppercase;
    }
    .party-info p {
      margin: 0.2rem 0;
      color: #94a3b8;
      font-size: 0.88rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      background: rgba(30, 41, 59, 0.4);
      border-radius: 16px;
      color: #94a3b8;
    }
    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }
    .explore-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }

    /* ─── Photo Request Tab ─── */
    .pending-badge { background: #f59e0b !important; }
    .status-tag.pending {
      background: rgba(234,179,8,0.2);
      color: #fbbf24;
      border: 1px solid rgba(234,179,8,0.4);
    }
    .photo-request-card { border-left: 3px solid #6366f1; }
    .request-message-box {
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-top: 0.75rem;
    }
    .request-message-box h4 {
      margin: 0 0 0.3rem 0;
      color: #cbd5e1;
      font-size: 0.82rem;
      text-transform: uppercase;
    }
    .request-message-box p { margin: 0; color: #e2e8f0; font-size: 0.88rem; }
    .upload-section {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(15,23,42,0.5);
      border-radius: 10px;
      border: 1px dashed rgba(255,255,255,0.12);
    }
    .upload-label {
      color: #a5b4fc;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      display: block;
      margin-bottom: 0.5rem;
    }
    .file-input {
      display: block;
      margin-bottom: 0.5rem;
      color: #94a3b8;
      font-size: 0.82rem;
    }
    .file-input::file-selector-button {
      background: #334155;
      color: #e2e8f0;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      margin-right: 0.5rem;
      font-family: inherit;
    }
    .selected-count { color: #94a3b8; font-size: 0.82rem; margin-bottom: 0.5rem; }
    .upload-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.6rem 1.2rem;
      font-weight: 700;
      font-family: inherit;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.25s;
    }
    .upload-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99,102,241,0.45);
    }
    .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .fulfilled-badge {
      margin-top: 0.75rem;
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.35);
      border-radius: 8px;
      padding: 0.6rem 1rem;
      color: #34d399;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .upload-error, .upload-success { margin-top: 0.5rem; font-size: 0.85rem; }

    .state-container {
      text-align: center;
      padding: 4rem 1rem;
      color: #94a3b8;
    }
    .spinner {
      border: 3px solid rgba(255,255,255,0.1);
      border-top: 3px solid #6366f1;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  activeTab: 'sales' | 'purchases' | 'photo-requests' = 'sales';
  sales: Order[] = [];
  purchases: Order[] = [];
  loading = true;
  error = '';

  // Photo requests state
  photoRequests: PhotoRequest[] = [];
  pendingPhotoCount = 0;
  selectedFiles: { [index: number]: File[] } = {};
  uploadingIndex: number | null = null;
  uploadErrors: { [index: number]: string } = {};
  uploadSuccess: { [index: number]: string } = {};

  constructor(
    private orderService: OrderService,
    private photoRequestService: PhotoRequestService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadPhotoRequests();
  }

  loadOrders(): void {
    this.loading = true;

    this.orderService.getSales().subscribe({
      next: (salesData) => {
        this.sales = salesData;
        this.orderService.getPurchases().subscribe({
          next: (purchasesData) => {
            this.purchases = purchasesData;
            this.loading = false;
          },
          error: (err) => {
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load order history.';
      }
    });
  }

  loadPhotoRequests(): void {
    this.photoRequestService.getMyRequests().subscribe({
      next: (requests) => {
        this.photoRequests = requests;
        // Pending count only matters for the seller (incoming requests to fulfill)
        this.pendingPhotoCount = requests.filter(r => r.status === 'Pending' && r.isSeller).length;
      },
      error: () => { /* silently fail */ }
    });
  }

  onFilesSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles[index] = Array.from(input.files);
    }
  }

  uploadPhotos(requestId: string, index: number): void {
    const files = this.selectedFiles[index];
    if (!files || files.length === 0) return;

    this.uploadingIndex = index;
    this.uploadErrors[index] = '';
    this.uploadSuccess[index] = '';

    this.photoRequestService.uploadPhotos(requestId, files).subscribe({
      next: (res) => {
        this.uploadingIndex = null;
        this.uploadSuccess[index] = `${res.photos.length} photo(s) uploaded successfully!`;
        this.selectedFiles[index] = [];
        // Refresh requests to update status
        this.loadPhotoRequests();
      },
      error: (err) => {
        this.uploadingIndex = null;
        this.uploadErrors[index] = err.error?.error || 'Failed to upload photos.';
      }
    });
  }

  getImageUrl(url?: string): string {
    if (!url) return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&q=80';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  }
}
