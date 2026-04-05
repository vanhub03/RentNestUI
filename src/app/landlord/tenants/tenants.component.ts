import { TenantService } from './../../_services/tenant.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landlord-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss',
})
export class LandlordTenantsComponent implements OnInit {
  keyword: string = '';
  isLoading: boolean = false;
  tenants: any[] = [];
  page = 0;
  totalPages = 0;
  totalElements = 0;
  size = 5;
  constructor(
    private cdr: ChangeDetectorRef,
    private tenantService: TenantService,
  ) {}
  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants() {
    this.isLoading = true;
    this.cdr.detectChanges();

    const params = {
      page: this.page,
      size: this.size,
      keyword: this.keyword,
    };

    this.tenantService.getLandlordTenants(params).subscribe({
      next: (res: any) => {
        this.tenants = res.content || [];
        this.totalPages = res.totalPages || 0;
        this.totalElements = res.totalElements || 0;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.tenants = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearch() {
    this.page = 0;
    this.loadTenants();
  }
  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadTenants();
    }
  }
}
