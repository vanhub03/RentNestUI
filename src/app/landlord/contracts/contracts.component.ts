import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContractService } from '../../_services/contract.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-landlord-contracts',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.scss',
})
export class LandlordContractsComponent implements OnInit {
  totalElements = 0;
  totalPages = 0;
  isLoading = true;
  contracts: any[] = [];
  previewModalOpen = false;
  previewTitle = '';
  previewType: 'image' | 'pdf' | 'office' | 'unsupported' = 'unsupported';
  previewUrl = '';
  safePreviewUrl: SafeResourceUrl | null = null;
  filter = {
    status: '',
    page: 0,
    size: 10,
  };
  constructor(
    private contractService: ContractService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadContracts();
  }
  loadContracts() {
    this.isLoading = true;
    this.contractService.getLandlordContracts(this.filter).subscribe({
      next: (res) => {
        this.contracts = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Không tải được danh sách hợp đồng');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openUploadedContractPreview(contract: any): void {
    if (!contract.contractFileUrl) {
      this.toastr.warning('Hợp đồng này chưa có file upload');
      return;
    }

    this.previewTitle = contract.contractCode
      ? `Hợp đồng #${contract.contractCode}`
      : 'Xem hợp đồng upload';
    this.previewUrl = contract.contractFileUrl;
    this.previewType = this.detectPreviewType(contract.contractFileUrl);
    if (this.previewType === 'image' || this.previewType === 'pdf') {
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(contract.contractFileUrl);
    } else if (this.previewType === 'office') {
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(contract.contractFileUrl)}`;
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
    } else {
      this.safePreviewUrl = null;
    }

    this.previewModalOpen = true;
  }

  detectPreviewType(fileUrl: string): 'image' | 'pdf' | 'office' | 'unsupported' {
    const cleanUrl = fileUrl.split('?')[0].toLowerCase();
    const extension = cleanUrl.substring(cleanUrl.lastIndexOf('.') + 1);
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
      return 'image';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return 'office';
    }
    return 'unsupported';
  }

  downloadUploadedContract(contract: any): void {
    if (!contract.contractFileUrl) {
      this.toastr.warning('Hợp đồng này chưa có file upload');
      return;
    }
    window.open(contract.contractFileUrl, '_blank', 'noopener');
  }

  closePreviewModal(): void {
    this.previewModalOpen = false;
    this.previewTitle = '';
    this.previewType = 'unsupported';
    this.previewUrl = '';
    this.safePreviewUrl = null;
  }

  onFilterChange() {
    this.filter.page = 0;
    this.loadContracts();
  }

  changePage(newPage: number) {
    if (newPage < 0 || newPage >= this.totalPages) return;
    this.filter.page = newPage;
    this.loadContracts();
  }
  renewContract(contract: any) {
    if (!contract.expiringSoon && contract.status !== 'EXPIRED') return;

    const input = prompt('Nhập số tháng muốn gia hạn (mặc định 12 tháng):');
    if (input === null) return; // Người dùng hủy prompt
    const months = Number(input);
    if (!Number.isInteger(months) || months <= 0 || months > 36) {
      this.toastr.error('Vui lòng nhập số tháng hợp lệ (1-36)');
      return;
    }
    this.contractService.renewLandlordContract(contract.id, months).subscribe({
      next: () => {
        this.toastr.success('Gia hạn hợp đồng thành công');
        this.loadContracts();
      },
      error: () => {
        this.toastr.error('Gia hạn hợp đồng thất bại');
      },
    });
  }

  getStatusLabel(contract: any): string {
    if (contract.expiringSoon) {
      return 'Sắp hết hạn';
    }
    switch (contract.status) {
      case 'ACTIVE':
        return 'Còn hiệu lực';
      case 'WAITING_FOR_SIGNATURE':
        return 'Chờ ký & đặt cọc';
      case 'EXPIRED':
        return 'Đã hết hạn';
      case 'TERMINATED':
        return 'Đã thanh lý';
      case 'DRAFT':
        return 'Bản nháp';
      default:
        return 'Chưa cập nhật';
    }
  }

  getStatusClass(contract: any): string {
    if (contract.expiringSoon) {
      return 'badge-warning text-white';
    }
    switch (contract.status) {
      case 'ACTIVE':
        return 'badge-success';
      case 'WAITING_FOR_SIGNATURE':
      case 'DRAFT':
        return 'badge-info';
      case 'EXPIRED':
      case 'TERMINATED':
      default:
        return 'badge-secondary';
    }
  }
}
