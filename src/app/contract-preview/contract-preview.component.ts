import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContractService } from '../_services/contract.service';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contract-preview',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contract-preview.component.html',
  styleUrl: './contract-preview.component.scss',
})
export class ContractPreviewComponent implements OnInit {
  isLandlord = false;
  contract: any = null;
  isLoading = true;
  hasAgreed = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.isLandlord = this.router.url.startsWith('/landlord');
    const requestId = Number(this.route.snapshot.paramMap.get('requestId'));
    const request$ = this.isLandlord
      ? this.contractService.getLandlordPreviewByRequest(requestId)
      : this.contractService.getTenantPreviewByRequest(requestId);
    request$.subscribe({
      next: (res) => {
        this.contract = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Không tải được hợp đồng xem trước');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
  get backLink(): any[] {
    return this.isLandlord ? ['/landlord/rental-requests'] : ['/my-requests'];
  }

  get statusLabel(): string {
    switch (this.contract?.status) {
      case 'DRAFT':
        return 'Hợp đồng nháp';
      case 'WAITING_FOR_SIGNATURE':
        return this.isLandlord ? 'Đang chờ người thuê thanh toán cọc' : 'Đang chờ thanh toán cọc';
      case 'ACTIVE':
        return 'Đang hiệu lực';
      default:
        return 'Đang xử lý';
    }
  }

  printContract() {
    window.print();
  }
  remindTenant() {}
  continueToDepositPayment() {}
}
