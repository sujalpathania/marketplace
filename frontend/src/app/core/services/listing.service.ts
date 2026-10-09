import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing } from '../../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = 'http://localhost:5000/api/listings';

  constructor(private http: HttpClient) {}

  getListings(search?: string, category?: string): Observable<Listing[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (category && category !== 'All') params = params.set('category', category);
    return this.http.get<Listing[]>(this.apiUrl, { params });
  }

  getListingById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`);
  }

  getMyListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}/my/listings`);
  }

  createListing(formData: FormData): Observable<{ message: string; listing: Listing }> {
    return this.http.post<{ message: string; listing: Listing }>(this.apiUrl, formData);
  }

  deleteListing(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
