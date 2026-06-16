import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import Service Phòng
import { TenantService } from '../../_services/tenant.service';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../_services/room.service';

interface OccupantForm {
  fullName: string;
  phoneNumber: string;
  identityCard: string;
  isRepresentative: boolean;
  cccdFrontFile: File | null;
  cccdFrontPreview: string;
  cccdBackFile: File | null;
  cccdBackPreview: string;
}
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

  rooms: any[] = [];
  isLoadingRooms = true;
  formData = {
    roomId: null as any,
    occupants: [this.createOccupant(true)],
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    depositAmount: 0,
    depositMethod: 'CASH',
  };
  contractFile: File | null = null;
  contractFileName: string = '';
  displayDepositAmount: string = '';

  constructor(
    private roomService: RoomService,
    private cdr: ChangeDetectorRef,
    private tenantService: TenantService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  private createOccupant(isRepresentative: boolean): OccupantForm {
    return {
      fullName: '',
      phoneNumber: '',
      identityCard: '',
      isRepresentative,
      cccdFrontFile: null,
      cccdFrontPreview: '',
      cccdBackFile: null,
      cccdBackPreview: '',
    };
  }

  // loadAvailableRooms() {
  //   this.isLoadingRooms = true;
  //   this.cdr.detectChanges();
  //   this.roomService.getAvailableRooms().subscribe({
  //     next: (res) => {
  //       this.availableRooms = res || [];
  //       this.isLoadingRooms = false;
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       this.availableRooms = [];
  //       this.isLoadingRooms = false;
  //       this.cdr.detectChanges();
  //     },
  //   });
  // }
  loadRooms(): void {
    this.isLoadingRooms = true;
    this.roomService.getLandlordRooms({ page: 0, size: 1000 }).subscribe({
      next: (res) => {
        const content = Array.isArray(res) ? res : (res?.content ?? []);
        this.rooms = content.filter((room: any) => ['AVAILABLE', 'RENTED'].includes(room.status));
        this.isLoadingRooms = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.rooms = [];
        this.isLoadingRooms = false;
        this.cdr.detectChanges();
        this.toastr.error('Không thể tải danh sách phòng, vui lòng thử lại sau');
      },
    });
  }

  get selectedRoomObj(): any {
    return this.rooms.find((room) => room.id === this.formData.roomId);
  }

  get isRentedRoom(): boolean {
    return this.selectedRoomObj?.status === 'RENTED';
  }

  get representative(): OccupantForm {
    return (
      this.formData.occupants.find((occupant) => occupant.isRepresentative) ??
      this.formData.occupants[0]
    );
  }

  selectRoom(room: any): void {
    this.formData.roomId = room.id;
    this.formData.occupants.forEach((occupant, index) => {
      occupant.isRepresentative = room.status === 'AVAILABLE' && index === 0;
    });
  }

  addOccupant(): void {
    this.formData.occupants.push(this.createOccupant(false));
  }

  removeOccupant(index: number): void {
    if (this.formData.occupants.length === 1) return;
    this.revokePreviewUrls(this.formData.occupants[index]);
    const removedRepresentative = this.formData.occupants[index].isRepresentative;
    this.formData.occupants.splice(index, 1);
    if (!this.isRentedRoom && removedRepresentative) {
      this.formData.occupants[0].isRepresentative = true;
    }
  }

  private revokePreviewUrls(occupant: OccupantForm) {
    if (occupant.cccdFrontPreview) URL.revokeObjectURL(occupant.cccdFrontPreview);
    if (occupant.cccdBackPreview) URL.revokeObjectURL(occupant.cccdBackPreview);
  }

  setRepresentative(index: number): void {
    if (this.isRentedRoom) return;
    this.formData.occupants.forEach((occupant, i) => {
      occupant.isRepresentative = i === index;
    });
  }

  triggerFileInput(inputId: string) {
    document.getElementById(inputId)?.click();
  }

  onCccdSelected(event: Event, index: number, side: 'front' | 'back') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toastr.warning('File CCC phải là hình ảnh');
      input.value = '';
      return;
    }
    const occupant = this.formData.occupants[index];
    const previewUrl = URL.createObjectURL(file);
    if (side === 'front') {
      if (occupant.cccdFrontPreview) URL.revokeObjectURL(occupant.cccdFrontPreview);
      occupant.cccdFrontFile = file;
      occupant.cccdFrontPreview = previewUrl;
    } else {
      if (occupant.cccdBackPreview) URL.revokeObjectURL(occupant.cccdBackPreview);
      occupant.cccdBackFile = file;
      occupant.cccdBackPreview = previewUrl;
    }
    input.value = '';
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

  continueAfterOccupants(): void {
    if (!this.validateOccupants()) return;
    this.currentStep = this.isRentedRoom ? 4 : 3;
  }
  backFromConfirmation(): void {
    this.currentStep = this.isRentedRoom ? 2 : 3;
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

  validateOccupants(): boolean {
    for (let index = 0; index < this.formData.occupants.length; index++) {
      const occupant = this.formData.occupants[index];
      if (!occupant.fullName.trim() || !occupant.phoneNumber.trim()) {
        this.toastr.warning(
          `Vui lòng nhập đủ họ tên và số điện thoại cho người thuê thứ ${index + 1}`,
        );
        return false;
      }
      if (!occupant.cccdFrontFile || !occupant.cccdBackFile) {
        this.toastr.warning(`Vui lòng upload dủ 2 mặt ảnh CCCD cho người thứ ${index + 1}`);
        return false;
      }
    }
    return true;
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
    if (this.isSubmitting || !this.validateOccupants() || !this.formData.roomId) return;

    this.isSubmitting = true;
    const payload = this.buildMultipartPayload();
    const request$ = this.isRentedRoom
      ? this.tenantService.addOccupantsToRentedRoom(this.formData.roomId, payload)
      : this.tenantService.onboardTenant(payload);
    request$.subscribe({
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

  private buildMultipartPayload(): FormData {
    const payload = new FormData();
    const occupants = this.formData.occupants.map((occupant) => {
      const payloadOccupant: any = {
        fullName: occupant.fullName.trim(),
        phoneNumber: occupant.phoneNumber.trim(),
        identityCard: occupant.identityCard.trim(),
      };
      if (!this.isRentedRoom) {
        payloadOccupant.isRepresentative = occupant.isRepresentative;
      }
      return payloadOccupant;
    });
    const data = this.isRentedRoom
      ? { occupants }
      : {
          roomId: this.formData.roomId,
          occupants,
          startDate: this.formData.startDate,
          endDate: this.formData.endDate,
          depositAmount: this.formData.depositAmount,
          depositMethod: this.formData.depositMethod,
        };
    payload.append('data', JSON.stringify(data));
    this.formData.occupants.forEach((occupant) => {
      payload.append('cccdFronts', occupant.cccdFrontFile as File);
      payload.append('cccdBacks', occupant.cccdBackFile as File);
    });
    if (!this.isRentedRoom && this.contractFile) {
      payload.append('contractFile', this.contractFile);
    }
    return payload;
  }
}
