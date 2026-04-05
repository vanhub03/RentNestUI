import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import Service Phòng
import { TenantService } from '../../_services/tenant.service';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../_services/room.service';

@Component({
  selector: 'app-add-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-tenant.component.html',
  styleUrl: './add-tenant.component.scss',
})
export class AddTenantComponent implements OnInit {
  currentStep = 1;
  isSuccess = false;
  isSubmitting = false;

  availableRooms: any[] = [];
  isLoadingRooms = true;
  formData = {
    roomId: null as any,
    occupants: [{ fullName: '', phoneNumber: '', identityCard: '', isRepresentative: true }],
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    depositAmount: 0,
    depositMethod: 'CASH',
  };
  contractFile: File | null = null;
  contractFileName: string = '';

  cccdFrontFile: File | null = null;
  cccdFrontPreview: string = '';

  cccdBackFile: File | null = null;
  cccdBackPreview: string = '';
  displayDepositAmount: string = '';

  constructor(
    private roomService: RoomService,
    private cdr: ChangeDetectorRef,
    private tenantService: TenantService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadAvailableRooms();
  }

  loadAvailableRooms() {
    this.isLoadingRooms = true;
    this.cdr.detectChanges();
    this.roomService.getAvailableRooms().subscribe({
      next: (res) => {
        this.availableRooms = res || [];
        this.isLoadingRooms = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.availableRooms = [];
        this.isLoadingRooms = false;
        this.cdr.detectChanges();
      },
    });
  }

  triggerFileInput(inputId: string) {
    document.getElementById(inputId)?.click();
  }

  onCccdSelected(event: any, side: 'front' | 'back') {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (side === 'front') {
        this.cccdFrontFile = file;
        this.cccdFrontPreview = previewUrl;
      } else {
        this.cccdBackFile = file;
        this.cccdBackPreview = previewUrl;
      }
    }
  }

  onContractSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.contractFile = file;
      this.contractFileName = file.name;
    }
  }

  goToStep(step: number) {
    if (step > this.currentStep && !this.validateCurrentStep()) return;
    this.currentStep = step;
  }

  validateCurrentStep(): boolean {
    if (this.currentStep === 1 && !this.formData.roomId) {
      this.toastr.warning('Vui lòng chọn 1 phòng trống');
      return false;
    }
    if (this.currentStep === 2) {
      const valid = this.formData.occupants.every((o) => o.fullName && o.phoneNumber);
      if (!valid) this.toastr.error('Vui lòng nhập đủ tên và sddt cho tất cả khách');
      return valid;
    }
    return true;
  }

  addOccupant() {
    this.formData.occupants.push({
      fullName: '',
      phoneNumber: '',
      identityCard: '',
      isRepresentative: false,
    });
  }
  removeOccupant(index: number) {
    if (this.formData.occupants.length <= 1) return;
    const wasRep = this.formData.occupants[index].isRepresentative;
    this.formData.occupants.splice(index, 1);
    if (wasRep && this.formData.occupants.length > 0) {
      this.formData.occupants[0].isRepresentative = true;
    }
  }

  setRepresentative(index: number) {
    this.formData.occupants.forEach((o, i) => (o.isRepresentative = i === index));
  }

  get representative() {
    return this.formData.occupants.find((o) => o.isRepresentative) || this.formData.occupants[0];
  }

  get selectedRoomObj() {
    return this.availableRooms.find((r) => r.id === this.formData.roomId);
  }

  formatDeposit(event: any) {
    let rawValue = event.target.value.replace(/\D/g, '');

    if (rawValue) {
      this.formData.depositAmount = parseInt(rawValue, 10);
      // Format thành dạng 5,000,000
      this.displayDepositAmount = new Intl.NumberFormat('en-US').format(
        this.formData.depositAmount,
      );
    } else {
      this.formData.depositAmount = 0;
      this.displayDepositAmount = '';
    }
  }
  pdfTemplateUrl =
    'https://cdn.luatminhkhue.vn/lmk/flgs/0/mau-hop-dong-cho-thue-nha-tro.docx?_gl=1*1brrbjl*_gcl_au*MTY2OTQwMzg4OC4xNzc1Mzc5MTAx';
  downloadContractTemplate() {
    const link = document.createElement('a');
    link.href = this.pdfTemplateUrl;
    link.target = '_blank';
    link.download = 'Mau_hop_dong_thue_nha.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printContractTemplate() {
    const printWindow = window.open(this.pdfTemplateUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  formatDateVN(dateString: string | null) {
    if (!dateString) return 'Vô thời hạn';
    const parts = dateString.split('-'); // 2025-12-31
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`; // 31/12/2025
    return dateString;
  }

  get depositMethodLabel() {
    const map: any = { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản', VNPAY: 'VNPay' };
    return map[this.formData.depositMethod] || 'Tiền mặt';
  }

  submitForm() {
    if (this.formData.depositAmount === null || this.formData.depositAmount === undefined) {
      this.toastr.warning('Vui lòng nhật số tiền đặt cọc');
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const payload = new FormData();
    payload.append('data', JSON.stringify(this.formData));
    if (this.contractFile) payload.append('contractFile', this.contractFile);
    if (this.cccdFrontFile) payload.append('cccdFront', this.cccdFrontFile);
    if (this.cccdBackFile) payload.append('cccdBack', this.cccdBackFile);

    this.tenantService.onboardTenant(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error(err.error?.message || 'Có lỗi xả ra, vui lòng thử lại');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }
}
