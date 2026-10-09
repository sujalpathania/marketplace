import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PhotoRequest {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName?: string;
  buyerEmail?: string;
  listingTitle?: string;
  listingImage?: string;
  message: string;
  status: 'Pending' | 'Fulfilled';
  createdAt: string;
  isSeller?: boolean;
}

export interface ListingPhoto {
  id: string;
  listingId: string;
  requestId: string;
  photoUrl: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoRequestService {
  private apiUrl = 'http://localhost:5000/api/photos';

  constructor(private http: HttpClient) {}

  // Buyer sends a request for more photos
  requestPhotos(listingId: string, message: string): Observable<{ message: string; request: PhotoRequest }> {
    return this.http.post<{ message: string; request: PhotoRequest }>(
      `${this.apiUrl}/${listingId}/request`,
      { message }
    );
  }

  // Get photo requests for a specific listing
  getRequestsForListing(listingId: string): Observable<PhotoRequest[]> {
    return this.http.get<PhotoRequest[]>(`${this.apiUrl}/${listingId}/requests`);
  }

  // Get all photo requests for the logged-in user (both incoming and outgoing)
  getMyRequests(): Observable<PhotoRequest[]> {
    return this.http.get<PhotoRequest[]>(`${this.apiUrl}/my-requests`);
  }

  // Seller uploads photos for a request
  uploadPhotos(requestId: string, files: File[]): Observable<{ message: string; photos: ListingPhoto[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    return this.http.post<{ message: string; photos: ListingPhoto[] }>(
      `${this.apiUrl}/${requestId}/upload`,
      formData
    );
  }

  // Get all extra photos for a listing
  getListingPhotos(listingId: string): Observable<ListingPhoto[]> {
    return this.http.get<ListingPhoto[]>(`${this.apiUrl}/${listingId}/photos`);
  }
}
