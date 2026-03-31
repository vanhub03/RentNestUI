import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LandlordLayoutComponent } from './layouts/landlord-layout/landlord-layout.component';
import { LandLordRoomsComponent } from './landlord/rooms/rooms.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'landlord',
    component: LandlordLayoutComponent,
    children: [
      { path: 'rooms', component: LandLordRoomsComponent },
      { path: '', redirectTo: 'rooms', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
