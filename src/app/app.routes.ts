import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LandlordLayoutComponent } from './layouts/landlord-layout/landlord-layout.component';
import { LandLordRoomsComponent } from './landlord/rooms/rooms.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LandlordTenantsComponent } from './landlord/tenants/tenants.component';
// import { AddTenantComponent } from './landlord/add-tenants/add-tenant.component';
import { PublicRoomsComponent } from './rooms/rooms.component';
import { RoomDetailComponent } from './room-detail/room-detail.component';
import { RentalRequests } from './landlord/rental-requests/rental-requests.component';
import { LandlordRentalRequestDetailComponent } from './landlord/rental-request-detail/rental-request-detail.component';
import { ContractPreviewComponent } from './contract-preview/contract-preview.component';
import { TenantLayoutComponent } from './layouts/tenant-layout/tenant-layout.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';
import { PaymentDepositComponent } from './payment-deposit/payment-deposit.component';
import { LandlordContractsComponent } from './landlord/contracts/contracts.component';
import { LandlordServicesComponent } from './landlord/services/services.component';
import { LandlordInvoicesComponent } from './landlord/invoices/invoices.component';
import { TenantInvoicesComponent } from './tenant-invoices/tenant-invoices.component';
import { PaymentInvoiceReturnComponent } from './payment-invoice-return/payment-invoice-return.component';
import { TenantRoomsComponent } from './tenant-rooms/tenant-rooms.component';
import { LandlordReportComponent } from './landlord/reports/reports.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'landlord',
    component: LandlordLayoutComponent,
    children: [
      { path: 'rooms', component: LandLordRoomsComponent },
      { path: 'tenants', component: LandlordTenantsComponent },
      { path: 'contracts', component: LandlordContractsComponent },
      // { path: 'add-tenant', component: AddTenantComponent },
      { path: 'rental-requests', component: RentalRequests },
      { path: 'rental-requests/:id', component: LandlordRentalRequestDetailComponent },
      { path: 'contract-preview/:requestId', component: ContractPreviewComponent },
      { path: 'services', component: LandlordServicesComponent },
      { path: 'invoices', component: LandlordInvoicesComponent },
      { path: 'reports', component: LandlordReportComponent },
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
      {
        path: '',
        component: TenantLayoutComponent,
        children: [
          { path: 'my-requests', component: MyRequestsComponent },
          { path: 'my-rooms', component: TenantRoomsComponent },
          { path: 'contract-preview/:requestId', component: ContractPreviewComponent },
          { path: 'payment-deposit/:requestId', component: PaymentDepositComponent },
          { path: 'payment-deposit/return', component: PaymentDepositComponent },
          { path: 'payment-invoice/return', component: PaymentInvoiceReturnComponent },
          { path: 'my-invoices', component: TenantInvoicesComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
