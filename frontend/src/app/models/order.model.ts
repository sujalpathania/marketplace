import { User } from './user.model';
import { Listing } from './listing.model';

export interface Order {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  listing?: Partial<Listing>;
  seller?: Partial<User>;
  buyer?: Partial<User>;
}
