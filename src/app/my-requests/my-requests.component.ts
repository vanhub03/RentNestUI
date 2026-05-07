import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RentalRequestService } from '../_services/rental-request.service';
import { StorageService } from '../_services/storage.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-requests',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.scss',
})
export class MyRequestsComponent implements OnInit {
  totalElements = 0;
  isLoading = true;
  requests: any[] = [];
  totalPages = 0;
  page = 0;
  constructor(
    private rentalRequestService: RentalRequestService,
    private storageService: StorageService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    if (!this.storageService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-requests' } });
      return;
    }
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.rentalRequestService.getMyRequests(this.page, 10).subscribe({
      next: (res) => {
        this.requests = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error('Không thể tải yêu cầu của bạn');
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  cancelRequest(requestId: number) {
    Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc muốn hủy yêu cầu này không?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.rentalRequestService.cancelRequest(requestId).subscribe({
          next: () => {
            this.toastr.success('Đã hủy yêu cầu thành công');
            this.loadRequests();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
          },
        });
      }
    });
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadRequests();
    }
  }
  getCardClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'request-card-wraper approved';
      case 'REJECTED':
        return 'request-card-wraper rejected';
      case 'CANCELLED':
        return 'request-card-wraper cancelled';
      default:
        return 'request-card-wraper pending';
    }
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }
  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'fas fa-check-circle';
      case 'REJECTED':
        return 'fas fa-times-circle';
      case 'CANCELLED':
        return 'fas fa-ban';
      default:
        return 'fas fa-clock';
    }
  }
  getStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'ĐÃ DUYỆT';
      case 'REJECTED':
        return 'ĐÃ TỪ CHỐI';
      case 'CANCELLED':
        return 'ĐÃ HỦY';
      default:
        return 'ĐANG CHỜ DUYỆT';
    }
  }
}
