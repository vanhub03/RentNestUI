import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContractService } from '../_services/contract.service';
import { PaymentService } from '../_services/payment.service';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-deposit',
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-deposit.component.html',
  styleUrl: './payment-deposit.component.scss',
})
export class PaymentDepositComponent implements OnInit {
  isLoading = true;
  isReturnPage = false;
  contract: any = null;
  requestId: number | null = null;
  isCreatingPayment = false;
  paymentResult: any = null;
  isConfirmingReturn = false;

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.isReturnPage = this.isReturnUrl();
    if (this.isReturnPage) {
      this.confirmMomoReturn();
      return;
    }

    this.requestId = Number(this.route.snapshot.paramMap.get('requestId'));
    this.loadContract();
  }
  isReturnUrl(): boolean {
    const routePath = this.route.snapshot.url.map((segment) => segment.path).join('/');
    const queryParams = this.route.snapshot.queryParamMap;
    return (
      routePath === 'payment-deposit/return' &&
      queryParams.has('partnerCode') &&
      queryParams.has('orderId') &&
      queryParams.has('signature')
    );
  }
  loadContract() {
    if (!this.requestId) {
      this.toastr.error('Không tìm thấy mã yêu cầu thuê');
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.contractService.getTenantPreviewByRequest(this.requestId).subscribe({
      next: (res) => {
        this.contract = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Không tải được thông tin hợp đồng');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
  confirmMomoReturn() {
    this.isConfirmingReturn = true;
    const params: Record<string, string> = {};
    this.route.snapshot.queryParamMap.keys.forEach((key) => {
      params[key] = this.route.snapshot.queryParamMap.get(key) || '';
    });
    this.paymentService.confirmDepositMomoReturn(params).subscribe({
      next: (res) => {
        this.paymentResult = res;
        this.requestId = res.rentalRequestId;
        this.isLoading = false;
        this.isConfirmingReturn = false;
        this.toastr.success(
          res.success ? 'Thanh toán đặt cọc thành công' : 'Thanh toán đặt cọc thất bại',
        );
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.paymentResult = {
          success: false,
          message: err.error?.message || 'Có lỗi xảy ra khi xác nhận thanh toán',
        };
        this.isLoading = false;
        this.isConfirmingReturn = false;
        this.toastr.error(this.paymentResult.message);
        this.cdr.detectChanges();
      },
    });
  }
  createMomoPayment() {
    if (!this.requestId || this.isCreatingPayment) return;
    this.isCreatingPayment = true;
    this.paymentService.createDepositMomoUrl(this.requestId).subscribe({
      next: (res) => {
        const momoUrl = res.paymentUrl;
        window.location.href = momoUrl;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra khi tạo thanh toán');
        this.isCreatingPayment = false;
        this.cdr.detectChanges();
      },
    });
  }
}
