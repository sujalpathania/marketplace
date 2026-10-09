import { User } from './user.model';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  imageUrl?: string;
  status: 'Available' | 'Sold';
  createdAt: string;
  seller?: User;
}
