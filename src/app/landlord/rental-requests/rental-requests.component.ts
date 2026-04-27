import { filter } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RentalRequestService } from '../../_services/rental-request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rental-requests',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rental-requests.component.html',
  styleUrl: './rental-requests.component.scss',
})
export class RentalRequests implements OnInit {
  stats: any = { total: 0, pending: 0, approved: 0, rejected: 0 };
  requests: any[] = [];
  isLoading = true;
  totalPages = 0;
  filter = {
    status: '',
    roomId: '',
    tenantName: '',
    page: 0,
    size: 5,
  };
  rooms: any[] = [];
  isRejectModalOpen = false;
  isSubmittingReject = false;
  selectedRejectRequest: any = null;
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
    private requestService: RentalRequestService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
  ) {}
  ngOnInit(): void {
    this.loadStats();
    this.loadRequests();
  }
  loadStats() {
    this.requestService.getStats().subscribe((res) => {
      this.stats = res;
      this.cdr.detectChanges();
    });
  }
  getTimeAgo(date: string): string {
    const diff = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff === 0 ? 'Hôm nay' : `${diff} ngày trước`;
  }
  onFilterChange() {
    this.filter.page = 0;
    this.loadRequests();
  }
  loadRequests() {
    this.isLoading = true;
    this.requestService.getRequests(this.filter).subscribe((res) => {
      this.requests = res.content;
      this.totalPages = res.totalPages;
      this.isLoading = false;
      const roomMap = new Map<number, string>();
      if (this.rooms.length <= 0) {
        res.content.forEach((item: any) => {
          if (item.roomId && item.roomName) {
            roomMap.set(item.roomId, item.roomName);
          }
        });
        this.rooms = Array.from(roomMap.entries()).map(([id, roomName]) => ({
          id,
          roomName,
        }));
      }
      this.cdr.detectChanges();
    });
  }
  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.filter.page = newPage;
      this.loadRequests();
    }
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
        this.requestService.updateStatus(id, status, rejectReason).subscribe({
          next: () => {
            this.toastr.success('Cập nhật trạng thái thành công');
            this.loadStats();
            this.loadRequests();
          },
          error: (err) => {
            this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
          },
        });
      }
    });
  }

  openRejectModal(request: any) {
    this.selectedRejectRequest = request;
    this.rejectForm = { reason: '', note: '' };
    this.isRejectModalOpen = true;
  }

  closeRejectModal() {
    if (this.isSubmittingReject) {
      return;
    }
    this.isRejectModalOpen = false;
    this.selectedRejectRequest = null;
    this.rejectForm = { reason: '', note: '' };
  }
  submitReject() {
    if (!this.selectedRejectRequest) {
      return;
    }
    if (!this.rejectForm.reason) {
      this.toastr.warning('Vui lòng chọn lý do từ chối');
      return;
    }
    const note = this.rejectForm.note.trim();
    const rejectReason = note ? `${this.rejectForm.reason} : ${note}` : this.rejectForm.reason;
    this.isSubmittingReject = true;
    this.updateStatus(this.selectedRejectRequest.id, 'REJECTED', rejectReason);
  }
}
