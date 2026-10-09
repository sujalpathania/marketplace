import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
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
    .explore-btn {
      display: inline-block;
      margin-top: 1rem;
      background: #6366f1;
      color: #fff;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
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
  activeTab: 'sales' | 'purchases' = 'sales';
  sales: Order[] = [];
  purchases: Order[] = [];
  loading = true;
  error = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
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

  getImageUrl(url?: string): string {
    if (!url) return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&q=80';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  }
}
