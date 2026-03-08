import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LandlordLayoutComponent } from './layouts/landlord-layout/landlord-layout.component';
import { LandLordRoomsComponent } from './landlord/rooms/rooms.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'landlord',
    component: LandlordLayoutComponent,
    children: [
      { path: 'rooms', component: LandLordRoomsComponent },
      { path: '', redirectTo: 'rooms', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
