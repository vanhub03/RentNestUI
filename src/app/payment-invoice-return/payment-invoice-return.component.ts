import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService } from '../_services/payment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-invoice-return',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment-invoice-return.component.html',
  styleUrl: './payment-invoice-return.component.scss',
})
export class PaymentInvoiceReturnComponent implements OnInit {
  paymentResult: any = null;
  isLoading = true;
  invoiceId: number | null = null;
  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.confirmMomoReturn();
  }
  private confirmMomoReturn(): void {
    const params: Record<string, string> = {};
    this.route.snapshot.queryParamMap.keys.forEach((key) => {
      params[key] = this.route.snapshot.queryParamMap.get(key) || '';
    });
    this.paymentService.confirmInvoiceMomoReturn(params).subscribe({
      next: (res) => {
        this.paymentResult = res;
        this.invoiceId = res.invoiceId || null;
        this.isLoading = false;
        this.toastr[res.success ? 'success' : 'warning'](res.message);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.paymentResult = {
          success: false,
          message: err.error?.message || err.error || 'Không xác nhận được giao dịch',
        };
        this.isLoading = false;
        this.toastr.error(this.paymentResult.message);
        this.cdr.detectChanges();
      },
    });
  }
}
