import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';

@Component({
  selector: 'app-listing-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-page">
      <div class="create-card">
        <div class="card-header">
          <h2>Sell an Item 🏷️</h2>
          <p>List your unused textbooks, electronics, or dorm gear for campus buyers</p>
        </div>

        <div *ngIf="error" class="alert error-alert">
          {{ error }}
        </div>

        <form (ngSubmit)="onSubmit()" #createForm="ngForm">
          <div class="form-group">
            <label for="title">Item Name / Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              [(ngModel)]="title"
              required
              placeholder="e.g., Organic Chemistry 8th Edition Textbook"
              class="form-control"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                [(ngModel)]="price"
                required
                min="0.01"
                step="0.01"
                placeholder="45.00"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="category">Category *</label>
              <select id="category" name="category" [(ngModel)]="category" required class="form-control">
                <option value="" disabled>Select category</option>
                <option value="Textbooks">Textbooks</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="condition">Condition *</label>
            <select id="condition" name="condition" [(ngModel)]="condition" required class="form-control">
              <option value="" disabled>Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea
              id="description"
              name="description"
              [(ngModel)]="description"
              required
              rows="4"
              placeholder="Provide details about the item's condition, edition, pick-up location on campus..."
              class="form-control"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="image">Item Image (Upload File)</label>
            <input
              type="file"
              id="image"
              (change)="onFileSelected($event)"
              accept="image/*"
              class="form-control file-input"
            />
          </div>

          <button type="submit" [disabled]="createForm.invalid || loading" class="submit-btn">
            <span *ngIf="!loading">Publish Listing</span>
            <span *ngIf="loading">Publishing...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .create-page {
      display: flex;
      justify-content: center;
      padding: 2.5rem 1rem;
    }
    .create-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 600px;
      backdrop-filter: blur(16px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    .card-header h2 {
      margin: 0 0 0.5rem 0;
      color: #fff;
      font-size: 1.8rem;
    }
    .card-header p {
      color: #94a3b8;
      margin: 0 0 1.5rem 0;
      font-size: 0.95rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 500px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
    .form-group label {
      display: block;
      color: #cbd5e1;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.4rem;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(15, 23, 42, 0.6);
      color: #fff;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #6366f1;
    }
    .file-input {
      padding: 0.5rem;
      cursor: pointer;
    }
    select.form-control option {
      background: #0f172a;
      color: #fff;
    }
    .submit-btn {
      width: 100%;
      padding: 0.9rem;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #fff;
      font-weight: 700;
      font-size: 1.05rem;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: opacity 0.2s;
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .error-alert {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 0.85rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
    }
  `]
})
export class ListingCreateComponent {
  title = '';
  price: number | null = null;
  category = '';
  condition = '';
  description = '';
  selectedFile: File | null = null;
  loading = false;
  error = '';

  constructor(private listingService: ListingService, private router: Router) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (!this.title || !this.price || !this.category || !this.condition || !this.description) return;

    this.loading = true;
    this.error = '';

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('price', this.price.toString());
    formData.append('category', this.category);
    formData.append('condition', this.condition);
    formData.append('description', this.description);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.listingService.createListing(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/listings', res.listing.id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to publish listing. Please try again.';
      }
    });
  }
}
