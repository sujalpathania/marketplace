import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { PhotoRequestService, PhotoRequest, ListingPhoto } from '../../core/services/photo-request.service';
import { Listing } from '../../models/listing.model';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="detail-container">
      <a routerLink="/listings" class="back-link">← Back to Marketplace</a>

      <div *ngIf="loading" class="state-container">
        <div class="spinner"></div>
        <p>Loading item details...</p>
      </div>

      <div *ngIf="error" class="alert error-alert">{{ error }}</div>

      <div *ngIf="!loading && listing" class="detail-card">

        <!-- Image Column -->
        <div class="detail-image-col">
          <img [src]="getImageUrl(listing.imageUrl)" [alt]="listing.title" class="detail-img" />
          <span [class.sold-badge]="listing.status === 'Sold'" [class.avail-badge]="listing.status === 'Available'" class="status-overlay">
            {{ listing.status }}
          </span>
        </div>

        <!-- Info Column -->
        <div class="detail-info-col">
          <div class="meta-row">
            <span class="category-pill">{{ listing.category }}</span>
            <span class="condition-pill">{{ listing.condition }}</span>
          </div>

          <h1 class="item-title">{{ listing.title }}</h1>
          <div class="price-tag">₹{{ listing.price | number:'1.2-2' }}</div>

          <div class="seller-card">
            <h4>Seller Information</h4>
            <div class="seller-row">
              <div class="seller-avatar">{{ (listing.seller?.fullName || 'S')[0].toUpperCase() }}</div>
              <div>
                <p><strong>{{ listing.seller?.fullName }}</strong></p>
                <p class="seller-email">{{ listing.seller?.email }}</p>
                <p *ngIf="listing.seller?.studentId" class="seller-sid">ID: {{ listing.seller?.studentId }}</p>
              </div>
            </div>
          </div>

          <div class="description-box">
            <h4>Description</h4>
            <p>{{ listing.description }}</p>
          </div>

          <!-- ─── Extra Photos Gallery ─── -->
          <div *ngIf="extraPhotos.length > 0" class="extra-photos-section">
            <h4>📸 Additional Photos</h4>
            <div class="extra-photos-grid">
              <div *ngFor="let photo of extraPhotos" class="extra-photo-card" (click)="openLightbox(photo.photoUrl)">
                <img [src]="getImageUrl(photo.photoUrl)" alt="Additional photo" />
              </div>
            </div>
          </div>

          <!-- ─── Request More Photos ─── -->
          <div *ngIf="!isSeller() && listing.status === 'Available' && authService.isLoggedIn()" class="photo-request-section">
            <div *ngIf="!hasActivePhotoRequest && !photoRequestSuccess" class="request-photos-box">
              <h4>📷 Need more photos?</h4>
              <p class="request-hint">Ask the seller for additional images of this item</p>
              <textarea
                [(ngModel)]="photoRequestMessage"
                placeholder="e.g. Can you send a close-up of the cover / back side?"
                class="request-textarea"
                rows="2"
              ></textarea>
              <button
                (click)="sendPhotoRequest()"
                [disabled]="sendingPhotoRequest"
                class="request-btn"
                id="request-photos-btn"
              >
                <span *ngIf="!sendingPhotoRequest">📨 Request More Photos</span>
                <span *ngIf="sendingPhotoRequest">Sending...</span>
              </button>
            </div>
            <div *ngIf="hasActivePhotoRequest && !photoRequestSuccess" class="request-pending-badge">
              ⏳ Photo request sent — waiting for seller to upload.
            </div>
            <div *ngIf="photoRequestSuccess" class="alert success-alert photo-req-success">
              ✅ {{ photoRequestSuccess }}
            </div>
            <div *ngIf="photoRequestError" class="alert error-alert">
              {{ photoRequestError }}
            </div>
          </div>

          <!-- Alerts -->
          <div *ngIf="successMessage" class="alert success-alert">
            🎉 {{ successMessage }}
            <div class="address-summary" *ngIf="confirmedAddress">
              <div class="addr-line">📦 Delivering to:</div>
              <div class="addr-line"><strong>{{ confirmedAddress.name }}</strong> · {{ confirmedAddress.phone }}</div>
              <div class="addr-line">{{ confirmedAddress.line1 }}<span *ngIf="confirmedAddress.line2">, {{ confirmedAddress.line2 }}</span></div>
              <div class="addr-line">{{ confirmedAddress.city }}, {{ confirmedAddress.state }} – {{ confirmedAddress.pin }}</div>
            </div>
          </div>
          <div *ngIf="buyError" class="alert error-alert">{{ buyError }}</div>

          <!-- Action Box -->
          <div class="action-box">
            <button
              *ngIf="listing.status === 'Available' && !successMessage && !isSeller()"
              (click)="openAddressModal()"
              [disabled]="buying"
              class="buy-btn"
              id="buy-now-btn"
            >
              <span *ngIf="!buying">🛒 Buy Now for ₹{{ listing.price | number:'1.2-2' }}</span>
              <span *ngIf="buying">Processing Order...</span>
            </button>

            <!-- Seller Actions -->
            <div *ngIf="isSeller()" class="seller-actions-container">
              <div class="seller-notice">ℹ️ You uploaded this listing.</div>
              <button
                (click)="promptDelete()"
                [disabled]="deleting"
                class="delete-btn"
                id="delete-listing-btn"
              >
                <span *ngIf="!deleting">🗑️ Delete Listing</span>
                <span *ngIf="deleting">Deleting...</span>
              </button>
            </div>

            <div *ngIf="listing.status === 'Sold' && !isSeller()" class="sold-notice">🔒 This item has been sold.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ────── Checkout Modal ────── -->
    <div class="modal-backdrop" *ngIf="showAddressModal" (click)="closeModalOnBackdrop($event)">
      <div class="modal-card" id="address-modal">
        <div class="modal-header">
          <div>
            <h2>{{ checkoutStep === 'address' ? 'Delivery Address' : 'Payment Details' }}</h2>
            <p>{{ checkoutStep === 'address' ? 'Enter where you\\'d like this item delivered on campus' : 'Securely complete your purchase' }}</p>
          </div>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>

        <form (ngSubmit)="goToPayment()" #addrForm="ngForm" class="addr-form" *ngIf="checkoutStep === 'address'">
          <div class="form-row">
            <div class="form-group">
              <label for="addr-name">Full Name</label>
              <input id="addr-name" name="addrName" [(ngModel)]="address.name" required
                placeholder="Your full name" class="form-control" />
            </div>
            <div class="form-group">
              <label for="addr-phone">Phone Number</label>
              <input id="addr-phone" name="addrPhone" [(ngModel)]="address.phone" required
                placeholder="10-digit mobile" class="form-control" pattern="[0-9]{10}" />
            </div>
          </div>

          <div class="form-group">
            <label for="addr-line1">Address Line 1</label>
            <input id="addr-line1" name="addrLine1" [(ngModel)]="address.line1" required
              placeholder="Hostel block / Flat no. / Building name" class="form-control" />
          </div>

          <div class="form-group">
            <label for="addr-line2">Address Line 2 <span class="opt">(Optional)</span></label>
            <input id="addr-line2" name="addrLine2" [(ngModel)]="address.line2"
              placeholder="Street, Area, Landmark" class="form-control" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="addr-city">City</label>
              <input id="addr-city" name="addrCity" [(ngModel)]="address.city" required
                placeholder="City" class="form-control" />
            </div>
            <div class="form-group">
              <label for="addr-state">State</label>
              <input id="addr-state" name="addrState" [(ngModel)]="address.state" required
                placeholder="State" class="form-control" />
            </div>
            <div class="form-group pin-group">
              <label for="addr-pin">PIN Code</label>
              <input id="addr-pin" name="addrPin" [(ngModel)]="address.pin" required
                placeholder="6-digit PIN" class="form-control" pattern="[0-9]{6}" maxlength="6" />
            </div>
          </div>

          <!-- Order Summary inside modal -->
          <div class="order-summary">
            <div class="summary-row">
              <span>Item</span><span class="summary-val">{{ listing?.title }}</span>
            </div>
            <div class="summary-row">
              <span>Condition</span><span class="summary-val">{{ listing?.condition }}</span>
            </div>
            <div class="summary-row total-row">
              <span>Total</span><span class="summary-price">₹{{ listing?.price | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" (click)="closeModal()">Cancel</button>
            <button type="submit" class="confirm-btn" [disabled]="addrForm.invalid" id="next-btn">
              Next →
            </button>
         </div>
        </form>

        <form (ngSubmit)="confirmOrder()" #paymentForm="ngForm" class="addr-form" *ngIf="checkoutStep === 'payment'" autocomplete="off">
          <div class="form-group">
            <label for="card-num">Card Number</label>
            <div style="position:relative">
              <input id="card-num" name="cardNumber" [(ngModel)]="paymentDetails.cardNumber" (input)="sanitizeCard($event)" required pattern="^[0-9 ]{15,19}$" maxlength="19" placeholder="0000 0000 0000 0000" class="form-control" style="padding-left: 2.5rem;" autocomplete="off" />
              <span style="position:absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); font-size: 1.2rem;">💳</span>
            </div>
            <div class="field-error" *ngIf="cardNumberError">⚠️ Only numbers are allowed</div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Expiry Month</label>
              <select id="expiry-month" name="expiryMonth" [(ngModel)]="paymentDetails.expiryMonth" required class="form-control">
                <option value="" disabled>Month</option>
                <option *ngFor="let m of months" [value]="m">{{ m }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Expiry Year</label>
              <select id="expiry-year" name="expiryYear" [(ngModel)]="paymentDetails.expiryYear" required class="form-control">
                <option value="" disabled>Year</option>
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="cvv">CVV</label>
              <input type="password" id="cvv" name="cvv" [(ngModel)]="paymentDetails.cvv" (input)="sanitizeCvv($event)" required pattern="^[0-9]{3,4}$" maxlength="4" placeholder="123" class="form-control" autocomplete="new-password" />
            </div>
          </div>
          
          <div class="form-group">
            <label for="name-on-card">Name on Card</label>
            <input id="name-on-card" name="nameOnCard" [(ngModel)]="paymentDetails.nameOnCard" required placeholder="John Doe" class="form-control" autocomplete="off" />
          </div>

          <div class="order-summary">
            <div class="summary-row total-row">
              <span>Total to Pay</span><span class="summary-price">₹{{ listing?.price | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" (click)="checkoutStep = 'address'">← Back</button>
            <button type="submit" class="confirm-btn" [disabled]="paymentForm.invalid || buying" id="confirm-order-btn">
              <span *ngIf="!buying">Pay ₹{{ listing?.price | number:'1.2-2' }}</span>
              <span *ngIf="buying">Processing...</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ────── Delete Confirmation Modal ────── -->
    <div class="modal-backdrop" *ngIf="showDeleteModal" (click)="closeDeleteModalOnBackdrop($event)">
      <div class="modal-card confirm-modal-card" id="delete-modal">
        <div class="modal-header">
          <div>
            <h2>Delete Listing? 🗑️</h2>
            <p>Are you sure you want to delete this listing?</p>
          </div>
          <button class="modal-close" (click)="closeDeleteModal()">✕</button>
        </div>

        <div *ngIf="deleteError" class="alert error-alert">{{ deleteError }}</div>

        <p class="delete-warning-text">
          This will permanently remove <strong>"{{ listing?.title }}"</strong> from the campus marketplace. This action cannot be undone.
        </p>

        <div class="modal-actions">
          <button type="button" class="cancel-btn" (click)="closeDeleteModal()" [disabled]="deleting">Cancel</button>
          <button type="button" class="confirm-btn btn-danger-confirm" (click)="confirmDelete()" [disabled]="deleting" id="confirm-delete-btn">
            <span *ngIf="!deleting">Yes, Delete Listing</span>
            <span *ngIf="deleting">Deleting...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ────── Photo Lightbox ────── -->
    <div class="lightbox-overlay" *ngIf="lightboxUrl" (click)="closeLightbox()">
      <button class="lightbox-close" (click)="closeLightbox()">✕</button>
      <img [src]="getImageUrl(lightboxUrl)" alt="Full-size photo" />
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1060px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      position: relative;
      z-index: 1;
    }
    .back-link {
      color: #818cf8;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      margin-bottom: 1.5rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: #c4b5fd; }

    .detail-card {
      background: rgba(18, 26, 48, 0.8);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      overflow: hidden;
      display: grid;
      grid-template-columns: 1fr 1fr;
      backdrop-filter: blur(20px);
      box-shadow: 0 24px 60px rgba(0,0,0,0.4);
    }
    @media (max-width: 768px) {
      .detail-card { grid-template-columns: 1fr; }
    }

    /* Image */
    .detail-image-col {
      position: relative;
      background: #080d1a;
      min-height: 380px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .detail-img { width: 100%; height: 100%; object-fit: cover; }
    .status-overlay {
      position: absolute;
      top: 14px; left: 14px;
      padding: 0.4rem 0.9rem;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .avail-badge { background: rgba(16,185,129,0.9); color: #fff; }
    .sold-badge  { background: rgba(239,68,68,0.9);  color: #fff; }

    /* Info col */
    .detail-info-col {
      padding: 2rem;
      display: flex;
      flex-direction: column;
    }
    .meta-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
    .category-pill, .condition-pill {
      background: rgba(99,102,241,0.2);
      color: #a5b4fc;
      padding: 0.28rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .item-title { color: #fff; font-size: 1.75rem; font-weight: 800; margin: 0 0 0.4rem 0; letter-spacing: -0.5px; }
    .price-tag { font-size: 2.1rem; font-weight: 900; color: #34d399; margin-bottom: 1.5rem; letter-spacing: -1px; }

    /* Seller Card */
    .seller-card {
      background: rgba(9,13,26,0.6);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 1rem 1.1rem;
      margin-bottom: 1.25rem;
    }
    .seller-card h4 {
      margin: 0 0 0.75rem 0;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .seller-row { display: flex; align-items: flex-start; gap: 0.75rem; }
    .seller-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #d946ef);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 800; color: #fff; flex-shrink: 0;
    }
    .seller-row p { margin: 0; color: #e2e8f0; font-size: 0.9rem; }
    .seller-email { color: #64748b !important; font-size: 0.82rem !important; }
    .seller-sid { color: #475569 !important; font-size: 0.78rem !important; }

    /* Description */
    .description-box { margin-bottom: 1.25rem; flex: 1; }
    .description-box h4 {
      margin: 0 0 0.5rem 0;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .description-box p { color: #cbd5e1; line-height: 1.7; margin: 0; white-space: pre-line; font-size: 0.92rem; }

    /* Buttons & Notices */
    .action-box { margin-top: auto; }
    .buy-btn {
      width: 100%;
      padding: 1rem;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      font-size: 1.05rem;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(16,185,129,0.4);
      transition: all 0.25s;
      letter-spacing: 0.2px;
    }
    .buy-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(16,185,129,0.55);
      background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    }
    .buy-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .sold-notice, .seller-notice, .login-notice {
      padding: 1rem;
      border-radius: 10px;
      text-align: center;
      font-weight: 600;
      margin-top: 1rem;
      font-size: 0.9rem;
    }
    .sold-notice   { background: rgba(239,68,68,0.12); color: #fca5a5; border: 1px solid rgba(239,68,68,0.35); }
    .seller-notice { background: rgba(99,102,241,0.12); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.35); }
    .login-notice  { background: rgba(234,179,8,0.12); color: #fde047; border: 1px solid rgba(234,179,8,0.35); }
    .login-notice a { color: #fff; text-decoration: underline; }

    .seller-actions-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .delete-btn {
      width: 100%;
      padding: 0.9rem;
      border-radius: 12px;
      border: 1px solid rgba(239, 68, 68, 0.4);
      background: linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(185,28,28,0.35) 100%);
      color: #fca5a5;
      font-size: 0.98rem;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.25s;
    }
    .delete-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #fff;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.45);
      transform: translateY(-2px);
    }
    .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .confirm-modal-card { max-width: 480px; }
    .delete-warning-text { color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin: 1rem 0 1.5rem; }
    .btn-danger-confirm {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #fff;
      border: none;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }
    .btn-danger-confirm:hover:not(:disabled) {
      box-shadow: 0 10px 28px rgba(239, 68, 68, 0.6);
      transform: translateY(-1px);
    }

    /* Alerts */
    .alert { padding: 0.9rem 1rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.92rem; font-weight: 600; }
    .success-alert { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.4); color: #6ee7b7; }
    .error-alert   { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; }

    /* Address summary inside success */
    .address-summary {
      margin-top: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(16,185,129,0.08);
      border-radius: 8px;
      border: 1px solid rgba(16,185,129,0.2);
    }
    .addr-line { color: #a7f3d0; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.1rem; }

    /* Loading */
    .state-container { text-align: center; padding: 4rem 1rem; color: #94a3b8; }
    .spinner {
      border: 3px solid rgba(255,255,255,0.1);
      border-top: 3px solid #6366f1;
      border-radius: 50%;
      width: 36px; height: 36px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-card {
      background: rgba(12, 18, 36, 0.95);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 2rem;
      width: 100%;
      max-width: 580px;
      max-height: 92vh;
      overflow-y: auto;
      box-shadow: 0 32px 80px rgba(0,0,0,0.6);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .modal-header h2 {
      color: #fff;
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.3px;
    }
    .modal-header p { color: #64748b; font-size: 0.85rem; margin: 0; }
    .modal-close {
      background: rgba(255,255,255,0.07);
      border: none;
      color: #94a3b8;
      font-size: 1rem;
      width: 32px; height: 32px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
      margin-left: 1rem;
    }
    .modal-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }

    .addr-form { display: flex; flex-direction: column; gap: 0; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .form-row:has(select) {
      grid-template-columns: 1fr 1fr 1fr;
    }
    .form-row .pin-group { grid-column: span 1; }
    .field-error {
      color: #f87171;
      font-size: 0.78rem;
      font-weight: 600;
      margin-top: 0.35rem;
      animation: fadeIn 0.2s ease;
    }
    @media (max-width: 500px) {
      .form-row { grid-template-columns: 1fr; }
    }

    .form-group { margin-bottom: 0.9rem; }
    .form-group label {
      display: block;
      color: #94a3b8;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.4rem;
    }
    .opt { color: #475569; font-weight: 400; text-transform: none; letter-spacing: 0; }
    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(9,13,26,0.7);
      color: #fff;
      font-size: 0.92rem;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: rgba(99,102,241,0.6);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }
    .form-control::placeholder { color: #334155; }

    /* Order Summary in Modal */
    .order-summary {
      margin: 1rem 0;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 1rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.4rem 0;
      font-size: 0.88rem;
      color: #64748b;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-val { color: #cbd5e1; font-weight: 600; }
    .total-row { margin-top: 0.25rem; }
    .total-row span:first-child { color: #94a3b8; font-weight: 700; }
    .summary-price { color: #34d399; font-size: 1.15rem; font-weight: 900; }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .cancel-btn {
      flex: 1;
      padding: 0.85rem;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: transparent;
      color: #94a3b8;
      font-weight: 600;
      font-family: inherit;
      font-size: 0.92rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cancel-btn:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
    .confirm-btn {
      flex: 2;
      padding: 0.85rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      font-weight: 800;
      font-size: 0.95rem;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(16,185,129,0.4);
      transition: all 0.25s;
    }
    .confirm-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 10px 28px rgba(16,185,129,0.55);
    }
    .confirm-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

    /* ─── Extra Photos ─── */
    .extra-photos-section { margin-top: 1.5rem; }
    .extra-photos-section h4 { color: #e2e8f0; margin: 0 0 0.75rem 0; font-size: 1rem; }
    .extra-photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.6rem;
    }
    .extra-photo-card {
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 1px solid rgba(255,255,255,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      aspect-ratio: 1;
    }
    .extra-photo-card:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(99,102,241,0.35);
    }
    .extra-photo-card img { width: 100%; height: 100%; object-fit: cover; }

    /* ─── Photo Request ─── */
    .photo-request-section { margin-top: 1.5rem; }
    .request-photos-box {
      background: rgba(99,102,241,0.08);
      border: 1px dashed rgba(99,102,241,0.4);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .request-photos-box h4 { color: #e2e8f0; margin: 0 0 0.25rem 0; }
    .request-hint { color: #94a3b8; font-size: 0.82rem; margin: 0 0 0.75rem 0; }
    .request-textarea {
      width: 100%;
      background: rgba(15,23,42,0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #e2e8f0;
      font-family: inherit;
      font-size: 0.88rem;
      padding: 0.6rem 0.8rem;
      resize: vertical;
      margin-bottom: 0.75rem;
      box-sizing: border-box;
    }
    .request-textarea:focus { outline: none; border-color: #6366f1; }
    .request-btn {
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
    .request-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99,102,241,0.45);
    }
    .request-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .request-pending-badge {
      background: rgba(234,179,8,0.12);
      border: 1px solid rgba(234,179,8,0.35);
      border-radius: 10px;
      padding: 0.8rem 1rem;
      color: #fbbf24;
      font-weight: 600;
      font-size: 0.88rem;
    }
    .photo-req-success { margin-top: 0; }

    /* ─── Lightbox ─── */
    .lightbox-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox-overlay img {
      max-width: 90vw;
      max-height: 85vh;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }
    .lightbox-close {
      position: absolute;
      top: 1.5rem;
      right: 2rem;
      background: rgba(255,255,255,0.15);
      border: none;
      color: #fff;
      font-size: 1.8rem;
      width: 44px; height: 44px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox-close:hover { background: rgba(255,255,255,0.3); }
   `]
    })
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  loading = true;
  buying = false;
  deleting = false;
  error = '';
  buyError = '';
  deleteError = '';
  successMessage = '';

  // Modals state
  showAddressModal = false;
  checkoutStep: 'address' | 'payment' = 'address';
  showDeleteModal = false;
  confirmedAddress: any = null;
  address = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pin: '' };
  paymentDetails = { cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', nameOnCard: '' };
  cardNumberError = false;
  months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  years: string[] = [];

  // Photo request state
  extraPhotos: ListingPhoto[] = [];
  photoRequests: PhotoRequest[] = [];
  hasActivePhotoRequest = false;
  photoRequestMessage = '';
  sendingPhotoRequest = false;
  photoRequestSuccess = '';
  photoRequestError = '';
  lightboxUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingService,
    private orderService: OrderService,
    public authService: AuthService,
    private photoRequestService: PhotoRequestService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetail(id);
      this.loadExtraPhotos(id);
      this.loadPhotoRequests(id);
    }
    // Build next 10 years for expiry dropdown
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.years.push(String(currentYear + i).slice(-2));
    }
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.listingService.getListingById(id).subscribe({
      next: (data) => { this.listing = data; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Listing not found or could not be loaded.'; }
    });
  }

  openAddressModal(): void {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    // Pre-fill name from logged in user
    const user = this.authService.currentUser();
    if (user) this.address.name = user.fullName || '';
    this.checkoutStep = 'address';
    this.showAddressModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showAddressModal = false;
    document.body.style.overflow = '';
  }

  closeModalOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  goToPayment(): void {
    this.checkoutStep = 'payment';
  }

  sanitizeCard(event: any): void {
    const raw = event.target.value;
    const cleaned = raw.replace(/[^0-9 ]/g, '');
    if (raw !== cleaned) {
      this.cardNumberError = true;
      setTimeout(() => this.cardNumberError = false, 2000);
    }
    this.paymentDetails.cardNumber = cleaned;
    event.target.value = cleaned;
  }

  sanitizeCvv(event: any): void {
    const cleaned = event.target.value.replace(/[^0-9]/g, '');
    this.paymentDetails.cvv = cleaned;
    event.target.value = cleaned;
  }

  confirmOrder(): void {
    if (!this.listing) return;
    this.buying = true;
    this.buyError = '';

    this.orderService.createOrder(this.listing.id).subscribe({
      next: (res) => {
        this.buying = false;
        this.showAddressModal = false;
        document.body.style.overflow = '';
        this.confirmedAddress = { ...this.address };
        
        // Estimate delivery logic: 2-3 days from now
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 2);
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const formattedDate = deliveryDate.toLocaleDateString('en-US', options);

        this.successMessage = `Payment successful! Estimated time of delivery: ${formattedDate}.`;
        if (this.listing) this.listing.status = 'Sold';
      },
      error: (err) => {
        this.buying = false;
        this.buyError = err.error?.error || 'Failed to complete order. Please try again.';
      }
    });
  }

  promptDelete(): void {
    this.deleteError = '';
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    document.body.style.overflow = '';
  }

  closeDeleteModalOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeDeleteModal();
    }
  }

  confirmDelete(): void {
    if (!this.listing) return;
    this.deleting = true;
    this.deleteError = '';

    this.listingService.deleteListing(this.listing.id).subscribe({
      next: () => {
        this.deleting = false;
        this.closeDeleteModal();
        this.successMessage = 'Listing deleted successfully! Redirecting to marketplace...';
        setTimeout(() => {
          this.router.navigate(['/listings']);
        }, 1200);
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError = err.error?.error || 'Failed to delete listing. Please try again.';
      }
    });
  }

  isSeller(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !this.listing?.seller) return false;
    return String(currentUser.id) === String(this.listing.seller.id);
  }

  getImageUrl(url?: string): string {
    if (!url) return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  }

  // ──── Photo Request Methods ────

  loadExtraPhotos(listingId: string): void {
    this.photoRequestService.getListingPhotos(listingId).subscribe({
      next: (photos) => { this.extraPhotos = photos; },
      error: () => { /* silently fail */ }
    });
  }

  loadPhotoRequests(listingId: string): void {
    this.photoRequestService.getRequestsForListing(listingId).subscribe({
      next: (requests) => {
        this.photoRequests = requests;
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.hasActivePhotoRequest = requests.some(
            r => r.buyerId === String(currentUser.id) && r.status === 'Pending'
          );
        }
      },
      error: () => { /* silently fail */ }
    });
  }

  sendPhotoRequest(): void {
    if (!this.listing) return;
    this.sendingPhotoRequest = true;
    this.photoRequestError = '';
    this.photoRequestSuccess = '';

    this.photoRequestService.requestPhotos(
      this.listing.id,
      this.photoRequestMessage || 'Please share more photos of this item.'
    ).subscribe({
      next: (res) => {
        this.sendingPhotoRequest = false;
        this.photoRequestSuccess = res.message;
        this.hasActivePhotoRequest = true;
        this.photoRequestMessage = '';
      },
      error: (err) => {
        this.sendingPhotoRequest = false;
        this.photoRequestError = err.error?.error || 'Failed to send photo request.';
      }
    });
  }

  openLightbox(url: string): void {
    this.lightboxUrl = url;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxUrl = null;
    document.body.style.overflow = '';
  }
}
