import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LandlordLayoutComponent } from './layouts/landlord-layout/landlord-layout.component';
import { LandLordRoomsComponent } from './landlord/rooms/rooms.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LandlordTenantsComponent } from './landlord/tenants/tenants.component';
import { AddTenantComponent } from './landlord/add-tenants/add-tenant.component';
import { PublicRoomsComponent } from './rooms/rooms.component';
import { RoomDetailComponent } from './room-detail/room-detail.component';
import { RentalRequests } from './landlord/rental-requests/rental-requests.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'landlord',
    component: LandlordLayoutComponent,
    children: [
      { path: 'rooms', component: LandLordRoomsComponent },
      { path: 'tenants', component: LandlordTenantsComponent },
      { path: 'add-tenant', component: AddTenantComponent },
      { path: 'rental-requests', component: RentalRequests },
      { path: '', redirectTo: 'rooms', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'rooms', component: PublicRoomsComponent },
      { path: 'rooms/:id', component: RoomDetailComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
