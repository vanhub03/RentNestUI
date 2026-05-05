import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentalRequestService } from '../../_services/rental-request.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landlord-rental-request-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rental-request-detail.component.html',
  styleUrl: './rental-request-detail.component.scss',
})
export class LandlordRentalRequestDetailComponent implements OnInit {
  requestId!: number;
  request: any = null;
  isLoading = true;
  isApproveSuccessOpen = false;
  isRejectModalOpen = false;
  rejectForm = {
    reason: '',
    note: '',
  };
  rejectReasons = [
    'Phòng đã có người đặt trước',
    'Không phù hợp yêu cầu',
    'Phòng đang bảo trì',
    'Lý do khác',
  ];
  constructor(
    private route: ActivatedRoute,
    private rentalRequestService: RentalRequestService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetail();
  }

  loadDetail() {
    this.isLoading = true;
    this.rentalRequestService.getRequestDetail(this.requestId).subscribe({
      next: (res) => {
        this.request = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load request detail', err);
        this.toastr.error('Không thể tải chi tiết yêu cầu', 'Lỗi');
        this.router.navigate(['/landlord/rental-requests']);
      },
    });
  }

  get statusClass() {
    return {
      approved: this.request?.status === 'APPROVED',
      rejected: this.request?.status === 'REJECTED',
      pending: this.request?.status === 'PENDING',
      cancelled: this.request?.status === 'CANCELLED',
    };
  }
  get avatarUrl() {
    const name = encodeURIComponent(this.request?.tenantName || 'Tenant');
    return `https://ui-avatars.com/api/?name=${name}&background=4A81D4&color=fff&size=160`;
  }
  get roomImage() {
    return this.request?.roomThumbnail || '';
  }
  get canReview() {
    return this.request?.status === 'PENDING';
  }
  openRejectModal() {
    this.rejectForm = { reason: '', note: '' };
    this.isRejectModalOpen = true;
  }
  closeRejectModal() {
    this.isRejectModalOpen = false;
    this.rejectForm = { reason: '', note: '' };
  }
  submitReject() {
    if (!this.rejectForm.reason) {
      this.toastr.warning('Vui lòng chọn lý do từ chối');
      return;
    }
    const note = this.rejectForm.note?.trim();
    const rejectReason = note ? `${this.rejectForm.reason} : ${note}` : this.rejectForm.reason;
    this.updateStatus(this.requestId, 'REJECTED', rejectReason);
  }
  updateStatus(id: number, status: string, rejectReason?: string) {
    const action = status === 'APPROVED' ? 'duyệt' : 'từ chối';
    Swal.fire({
      title: 'Xác nhận',
      text:
        action === 'duyệt'
          ? `nếu bạn duyệt request này, tất cả các request khác của phòng này sẽ bị tự động từ chối, bạn chắc chắn chứ?`
          : `bạn có chắc ${action} request này không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.rentalRequestService.updateStatus(id, status, rejectReason).subscribe({
          next: () => {
            this.toastr.success('Cập nhật trạng thái thành công');
            this.request.status = status;
            this.request.rejectReason = rejectReason || null;
            this.closeRejectModal();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
          },
        });
      }
    });
  }
  approveRequest(id: number, status: string) {
    const action = status === 'APPROVED' ? 'duyệt' : 'từ chối';
    Swal.fire({
      title: 'Xác nhận',
      text:
        action === 'duyệt'
          ? `nếu bạn duyệt request này, tất cả các request khác của phòng này sẽ bị tự động từ chối, bạn chắc chắn chứ?`
          : `bạn có chắc ${action} request này không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.rentalRequestService.updateStatus(id, status).subscribe({
          next: () => {
            this.toastr.success('Cập nhật trạng thái thành công');
            this.request.status = status;
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
          },
        });
      }
    });
  }
  closeApproveSuccess() {
    this.isApproveSuccessOpen = false;
    this.router.navigate(['/landlord/rental-requests']);
  }
  getStatusIcon(status: string) {
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
  getStatusLabel(status: string) {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      case 'CANCELLED':
        return 'Khách đã hủy';
      default:
        return 'Đang chờ';
    }
  }
}
