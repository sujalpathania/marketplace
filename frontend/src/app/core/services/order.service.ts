import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(listingId: string): Observable<{ message: string; order: Order }> {
    return this.http.post<{ message: string; order: Order }>(this.apiUrl, { listingId });
  }

  getPurchases(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-purchases`);
  }

  getSales(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-sales`);
  }
}
