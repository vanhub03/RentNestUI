import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LandlordServiceService } from '../../_services/landlord-service.service';
import { RoomService } from '../../_services/room.service';
import { ToastrService } from 'ngx-toastr';
import { apply } from '@angular/forms/signals';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landlord-services',
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class LandlordServicesComponent implements OnInit {
  services: any[] = [];
  hostels: any[] = [];
  totalElements = 0;
  totalPages = 0;
  isLoading = true;
  filter = {
    hostelId: '',
    page: 0,
    size: 10,
  };
  isModalOpen = false;
  editingService: any = null;
  isSubmitting = false;
  form = {
    hostelId: '',
    applyAllHostels: false,
    serviceName: '',
    unitPrice: 0,
    unitName: '',
    metered: false,
  };

  constructor(
    private serviceApi: LandlordServiceService,
    private roomService: RoomService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    //load hostel de render len man hinh
    this.loadHostels();
    //load service doc lap de bang van hoat dong ngay ca hi dropdown hostel loi
    this.loadServices();
  }

  loadHostels() {
    // this.isLoading = true;
    this.roomService.getLandlordHostels({ page: 0, size: 100 }).subscribe({
      next: (res) => {
        this.hostels = res.content;
        this.cdr.detectChanges();
        // this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading hostels', err);
        this.toastr.error('Không tải được danh sách tòa nhà');
        // this.isLoading = false;
      },
    });
  }

  loadServices() {
    this.isLoading = true;
    this.serviceApi.getServices(this.filter).subscribe({
      next: (res) => {
        this.services = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.services = [];
        this.isLoading = false;
        this.toastr.error('Không tải được dịch vụ');
        this.cdr.detectChanges();
      },
    });
  }

  onFilterChange() {
    this.filter.page = 0;
    this.loadServices();
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.filter.page = 0;
      this.loadServices();
    }
  }

  openCreateModal() {
    this.editingService = null;
    this.form = {
      hostelId: '',
      applyAllHostels: false,
      serviceName: '',
      unitPrice: 0,
      unitName: '',
      metered: false,
    };
    this.isModalOpen = true;
  }
  openEditModal(service: any) {
    this.editingService = service;
    this.form = {
      hostelId: String(service.hostelId),
      applyAllHostels: false,
      serviceName: service.serviceName,
      unitPrice: service.unitPrice,
      unitName: service.unitName,
      metered: service.metered,
    };
    this.isModalOpen = true;
  }

  closeModal() {
    if (this.isSubmitting) {
      return;
    }
    this.isModalOpen = false;
  }
  submitService() {
    if (!this.form.serviceName.trim() || !this.form.unitName.trim()) {
      this.toastr.warning('Vui lòng nhập đầy đủ tên dịch vụ và đơn vị tính');
      return;
    }
    if (!this.form.applyAllHostels && !this.form.hostelId) {
      this.toastr.warning('Vui lòng chọn tòa nhà hoặc áp dụng cho tất cả tòa nhà');
      return;
    }
    if (Number(this.form.unitPrice) < 0) {
      this.toastr.warning('Đơn giá không được âm');
      return;
    }

    const payload = {
      hostelId: this.form.applyAllHostels ? null : Number(this.form.hostelId),
      applyAllHostels: this.form.applyAllHostels,
      serviceName: this.form.serviceName.trim(),
      unitPrice: Number(this.form.unitPrice),
      unitName: this.form.unitName.trim(),
      metered: this.form.metered,
    };

    this.isSubmitting = true;

    const request$ = this.editingService
      ? this.serviceApi.updateServices(this.editingService.id, payload)
      : this.serviceApi.createServices(payload);
    request$.subscribe({
      next: () => {
        this.toastr.success(
          `Dịch vụ đã được ${this.editingService ? 'cập nhật' : 'tạo'} thành công`,
        );
        this.isSubmitting = false;
        this.isModalOpen = false;
        this.loadServices();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastr.error(
          `Không thể ${this.editingService ? 'cập nhật' : 'tạo'} dịch vụ: ${err.error?.message || err.message || 'Lỗi không xác định'}`,
        );
      },
    });
  }

  deleteService(service: any) {
    Swal.fire({
      title: 'Xác nhận',
      text: `Bạn có chắc muốn xóa dịch vụ "${service.serviceName}" không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceApi.deleteServices(service.id).subscribe({
          next: () => {
            this.toastr.success('Dịch vụ đã được xóa thành công');
          },
          error: (err) => {
            this.toastr.error(
              `Không thể xóa dịch vụ: ${err.error?.message || err.message || 'Lỗi không xác định'}`,
            );
          },
        });
      }
    });
  }
  getServiceIcon(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('điện') || name.includes('dien')) return 'fas fa-bold text-warning';
    if (name.includes('nước') || name.includes('nuoc')) return 'fas fa-tint text-info';
    if (name.includes('wifi') || name.includes('internet')) return 'fas fa-wifi text-primarsy';
    return 'fas fa-plug text-primary';
  }
}
