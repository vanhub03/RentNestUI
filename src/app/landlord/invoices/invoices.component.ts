import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../_services/invoice.service';
import { RoomService } from '../../_services/room.service';
import { LandlordServiceService } from '../../_services/landlord-service.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landlord-invoices',
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class LandlordInvoicesComponent implements OnInit {
  invoices: any[] = [];
  hostels: any[] = [];
  meteredServices: any[] = [];
  readings: any[] = [];
  isGenerating = false;
  totalPages = 0;
  generateForm = {
    hostelId: '',
    invoiceMonth: this.currentMonth(),
  };
  isModalOpen = false;
  isLoading = false;
  filter = {
    invoiceMonth: this.currentMonth(),
    status: '',
    page: 0,
    size: 10,
  };
  stats: any = {
    totalInvoices: 0,
    paidAmount: 0,
    debtAmount: 0,
  };
  selectedHostelRooms: any[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private roomService: RoomService,
    private serviceApi: LandlordServiceService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadHostels();
    this.loadStats();
    this.loadInvoices();
  }
  loadHostels() {
    this.roomService.getLandlordHostels({ page: 0, size: 100 }).subscribe({
      next: (res) => {
        this.hostels = res.content;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Không tải được danh sách tòa nhà');
      },
    });
  }
  loadStats() {
    this.invoiceService.getStats(this.filter.invoiceMonth).subscribe({
      next: (res) => {
        this.stats = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Không tải được thống kê hóa đơn');
      },
    });
  }
  loadInvoices() {
    this.isLoading = true;
    this.invoiceService.getInvoices(this.filter).subscribe({
      next: (res) => {
        this.invoices = res.content || [];
        this.isLoading = false;
        this.totalPages = res.totalPages;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.invoices = [];
        this.toastr.error('Không tải được danh sách hóa đơn');
        this.isLoading = false;
      },
    });
  }
  private currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  onFilterChange() {
    this.filter.page = 0;
    this.loadStats();
    this.loadInvoices();
  }
  openGenerateModal() {
    this.generateForm = { hostelId: '', invoiceMonth: this.filter.invoiceMonth };
    this.meteredServices = [];
    this.selectedHostelRooms = [];
    this.readings = [];
    this.isModalOpen = true;
  }
  closeGenerateModal() {
    if (!this.isGenerating) {
      this.isModalOpen = false;
    }
  }

  onGenerateHostelChange() {
    this.meteredServices = [];
    this.readings = [];
    if (!this.generateForm.hostelId) return;
    this.serviceApi
      .getServices({ hostelId: this.generateForm.hostelId, page: 0, size: 100 })
      .subscribe({
        next: (res) => {
          this.meteredServices = res.content.filter((s: any) => s.metered);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastr.error('Không tải được dịch vụ chốt số');
        },
      });
    this.roomService
      .getLandlordRooms({ hostelId: this.generateForm.hostelId, page: 0, size: 100 })
      .subscribe({
        next: (res) => {
          this.selectedHostelRooms = res.content;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastr.error('Không tải được phòng của tòa nhà');
        },
      });
  }

  addReading(service: any) {
    this.readings.push({
      serviceId: service.id,
      serviceName: service.serviceName,
      roomId: '',
      oldIndex: null,
      newIndex: null,
    });
  }
  removeReading(index: number) {
    this.readings.splice(index, 1);
  }

  generateInvoices() {
    if (!this.generateForm.hostelId || !this.generateForm.invoiceMonth) {
      this.toastr.warning('Vui lòng chọn tòa nhà và tháng hóa đơn');
      return;
    }
    const payload = {
      hostelId: Number(this.generateForm.hostelId),
      invoiceMonth: this.generateForm.invoiceMonth,
      readings: this.readings
        .filter((reading) => reading.roomId && reading.serviceId && reading.newIndex !== null)
        .map((reading) => ({
          roomId: Number(reading.roomId),
          serviceId: Number(reading.serviceId),
          oldIndex: reading.oldIndex === null ? null : Number(reading.oldIndex),
          newIndex: Number(reading.newIndex),
        })),
    };
    this.isGenerating = true;
    this.invoiceService.generateInvoices(payload).subscribe({
      next: (res) => {
        this.toastr.success(`Đã sinh ${res.length || 0} hóa đơn`);
        this.isGenerating = false;
        this.isModalOpen = false;
        this.filter.invoiceMonth = this.generateForm.invoiceMonth;
        this.loadStats();
        this.loadInvoices();
      },
      error: (err) => {
        this.isGenerating = false;
        this.toastr.error(err.error?.message || err.error || 'Không sinh được hóa đơn');
      },
    });
  }
  markPaid(invoice: any) {
    Swal.fire({
      title: 'Xác nhận',
      text: `Xác nhận đã thu đủ hóa đơn phòng ${invoice.roomName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.invoiceService.markPaid(invoice.id).subscribe({
          next: () => {
            this.toastr.success('Đã xác nhận thu tiền');
            this.loadStats();
            this.loadInvoices();
          },
          error: (err) =>
            this.toastr.error(err.error?.message || err.error || 'Không cập nhật được hóa đơn'),
        });
      }
    });
  }
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'OVERDUE':
        return 'Quá hạn';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return 'Chờ thanh toán';
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

  getRoomsForSelectedHostel(): any[] {
    return this.selectedHostelRooms;
  }
}
