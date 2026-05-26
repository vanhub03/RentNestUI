import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../_services/invoice.service';
import { PaymentService } from '../_services/payment.service';
import { StorageService } from '../_services/storage.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tenant-invoices',
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-invoices.component.html',
  styleUrl: './tenant-invoices.component.scss',
})
export class TenantInvoicesComponent implements OnInit {
  invoices: any[] = []; //danh sách hóa đơn theo năm đang chọn
  currentUnpaidInvoice: any = null; //hóa đơn chưa thanh toán gần nhất để hiển thị card
  selectedInvoice: any = null; //hóa đơn đang được mở modal chi tiết
  isLoading = true;
  isLoadingCurrent = true;
  page = 0;
  totalPages = 0;
  totalElements = 0;
  yearOptions: number[] = []; //danh sách năm cho dropdown filter
  filter = {
    year: String(new Date().getFullYear()), // mặc định xem hóa đơn năm hiện tại
    page: 0,
    size: 10,
  };
  isCreatingInvoicePaymentId: number | null = null; //id hoa don dang tao Momo de disable dung nut
  constructor(
    private invoiceService: InvoiceService, //goi api hoa don tenant
    private paymentService: PaymentService, //goi api tao paymentUrl momo cho hoa don
    private storageService: StorageService, //kiem tra tenant da login chua
    private toastr: ToastrService, //hien thi thong bao loi/thong tin
    private router: Router, //dieu huong sang trang khac
    private cdr: ChangeDetectorRef, // ep angular cap nhat UI sau khi load du lieu
  ) {}
  ngOnInit(): void {
    if (!this.storageService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-invoices' } });
      return;
    }

    const currentYear = new Date().getFullYear();
    this.yearOptions = [currentYear, currentYear - 1, currentYear - 2]; // cho tenant xem 3 nam gan nhat
    this.loadCurrentUnpaidInvoice(); //load hoa don gan nhat chua thanh toan
    this.loadInvoices(); //load danh sach hoa don
  }

  loadCurrentUnpaidInvoice() {
    //goi API lay hoa don chua thanh toan gan nhat
    this.invoiceService.getTenantCurrentUnpaid().subscribe({
      next: (res) => {
        this.currentUnpaidInvoice = res;
        this.isLoadingCurrent = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.currentUnpaidInvoice = null;
        this.isLoadingCurrent = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadInvoices() {
    this.isLoading = true;
    this.filter.page = this.page; //dong bo page hien tai vao filter gui API
    this.invoiceService.getTenantInvoices(this.filter).subscribe({
      next: (res) => {
        this.invoices = res.content || [];
        this.totalPages = res.totalPages || 0;
        this.totalElements = res.totalElements || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.invoices = []; //xoa data cu khi
        this.isLoading = false;
        this.toastr.error('Không tải được danh sách hóa đơn');
        this.cdr.detectChanges();
      },
    });
  }

  onYearChange() {
    this.page = 0;
    this.loadInvoices();
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadInvoices();
    }
  }

  viewInvoice(invoice: any) {
    this.invoiceService.getTenantInvoiceDetail(invoice.id).subscribe({
      next: (res) => {
        this.selectedInvoice = res;
        this.cdr.detectChanges();
      },
      error: () => this.toastr.error('Không tải được chi tiết hóa đơn'),
    });
  }

  closeDetail() {
    this.selectedInvoice = null; //dong modal chi tiet
  }

  printInvoice(invoice: any) {
    this.selectedInvoice = invoice; //dam bao modal dang chua hoa don can in
    setTimeout(() => window.print(), 0); //delay 0ms de angular render modal truoc khi goi print
  }

  payInvoice(invoice: any) {
    //tao thanh toan momo cho hoa don tenant chon
    if (!invoice?.id || this.isCreatingInvoicePaymentId) {
      //khong co invoice id hoac tao giao dich thi bo qua
      return;
    }
    this.isCreatingInvoicePaymentId = invoice.id; //luu id hoa don dang xu ly de UI hien loading
    this.paymentService.createInvoiceMomoUrl(invoice.id).subscribe({
      next: (res) => {
        window.location.href = res.paymentUrl; //chuyen tenant sang tranh thanh toan momo
      },
      error: (err) => {
        this.isCreatingInvoicePaymentId = null;
        this.toastr.error(
          err.error?.message || err.error || 'Không tạo được thanh toán hóa đơn momo',
        );
        this.cdr.detectChanges();
      },
    });
  }
  getHistoryInvoices(): any[] {
    //tra danh sach lich su ben duoi card nợ
    if (!this.currentUnpaidInvoice) {
      return this.invoices;
    }
    return this.invoices.filter((invoice) => invoice.id !== this.currentUnpaidInvoice.id);
  }

  getStatusLabel(status: string): string {
    //doi status enum tu backend thanh text tieng viet
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'OVERDUE':
        return 'Quá hạn';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return 'Chưa thanh toán';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'badge-success';
      case 'OVERDUE':
        return 'badge-danger';
      case 'CANCELLED':
        return 'badge-secondary';
      default:
        return 'badge-danger';
    }
  }

  formatMonth(invoiceMonth: string): string {
    if (!invoiceMonth) {
      return '';
    }
    const [year, month] = invoiceMonth.split('-'); //tach chuoi, vi du 2026-02 thi tach thanh year=2026, month=02
    return `Tháng ${month}/${year}`;
  }
}
