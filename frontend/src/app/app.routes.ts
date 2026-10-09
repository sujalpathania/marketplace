import { Routes } from '@angular/router';
import { ListingListComponent } from './pages/listing-list/listing-list.component';
import { ListingDetailComponent } from './pages/listing-detail/listing-detail.component';
import { ListingCreateComponent } from './pages/listing-create/listing-create.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'listings', pathMatch: 'full' },
  { path: 'listings', component: ListingListComponent },
  { path: 'listings/:id', component: ListingDetailComponent },
  { path: 'sell', component: ListingCreateComponent, canActivate: [authGuard] },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: 'listings' }
];
