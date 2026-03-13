import { HttpClient } from '@angular/common/http';
import { RoomService } from './../../_services/room.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class LandLordRoomsComponent implements OnInit {
  viewMode: 'rooms' | 'hostels' = 'rooms';
  hostelsLoaded = false;
  hostelsLoading = false;
  hostelFilter = {
    page: 0,
    size: 5,
  };
  hostelKeyword = '';
  hostels: any[] = [];
  hostelTotalElements = 0;
  hostelTotalPages = 0;
  isHostelModalOpen = false;
  isSubmittingHostel = false;
  //model cua modal hostel
  newHostel: any = {
    name: '',
    cityCode: '',
    districtCode: '',
    wardCode: '',
    addressDetail: '',
    description: '',
  };
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  filter = {
    keyword: '',
    status: '',
    hostelId: '',
    page: 0,
    size: 5,
  };
  hostelOptionsLoading = false;
  roomsLoading = false;
  constructor(
    private roomService: RoomService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private http: HttpClient,
  ) {}
  ngOnInit(): void {
    this.loadHostels();
    this.loadProvinces();
    this.loadRooms();
    this.loadHostelOptions();
  }
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  isDistrictLoading = false;
  isWardLoading = false;
  rooms: any[] = [];
  totalElements = 0;
  totalPages = 0;
  hostelOptions: any[] = [];
  isRoomModalOpen = false;
  isSubmittingRoom = false;
  newRoom: any = {
    hostelId: '',
    roomName: '',
    basePrice: null,
    area: null,
    floor: null,
    bathCount: null,
    bedType: 'Không có giường',
    status: 'AVAILABLE',
  };
  roomBasePriceDisplay = '';
  roomImagePreviews: string[] = [];
  roomSelectedFiles: File[] = [];
  openRoomModal() {
    this.isRoomModalOpen = true;
    this.isSubmittingRoom = false;
    this.newRoom = {
      hostelId: '',
      roomName: '',
      basePrice: null,
      area: null,
      floor: null,
      bathCount: null,
      bedType: 'Không có giường',
      status: 'AVAILABLE',
    };
    this.roomBasePriceDisplay = '';
  }
  closeRoomModal() {
    this.isRoomModalOpen = false;
    this.isSubmittingRoom = false;
    this.roomSelectedFiles = [];
    this.roomImagePreviews = [];
  }

  onRoomOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeRoomModal();
    }
  }
  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }
  removeRoomImage(index: number) {
    this.roomSelectedFiles.splice(index, 1);
    this.roomImagePreviews.splice(index, 1);
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length) {
      this.appendFiles(files, this.selectedFiles, this.imagePreviews);
    }
    input.value = '';
  }
  onRoomFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length) {
      this.appendFiles(files, this.roomSelectedFiles, this.roomImagePreviews);
    }
    input.value = '';
  }
  private readonly maxImagesPerUpload = 5;
  appendFiles(files: File[], targetFiles: File[], targetPreview: string[]): void {
    const availableSlots = this.maxImagesPerUpload - targetFiles.length;
    if (availableSlots <= 0) {
      this.toastr.warning(`Chỉ được tải tối đa ${this.maxImagesPerUpload} ảnh.`);
      return;
    }
    const acceptedFiles = files.slice(0, availableSlots);
    if (acceptedFiles.length < files.length) {
      this.toastr.warning(`Chỉ được tải tối đa ${this.maxImagesPerUpload} ảnh.`);
    }
    for (const file of acceptedFiles) {
      targetFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          targetPreview.push(reader.result);
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(file);
    }
  }
  onRoomBasePriceInput(value: string) {
    const digits = value.replace(/\D/g, '');
    this.newRoom.basePrice = digits ? Number(digits) : null;
    this.roomBasePriceDisplay = digits ? Number(digits).toLocaleString('vi-VN') : '';
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.filter.page = newPage;
      this.loadRooms();
    }
  }

  loadRooms() {
    this.roomsLoading = true;
    let queryParam: any = {
      page: this.filter.page,
      size: this.filter.size,
    };
    if (this.filter.keyword) queryParam.keyword = this.filter.keyword;
    if (this.filter.status) queryParam.status = this.filter.status;
    if (this.filter.hostelId) queryParam.hostelId = this.filter.hostelId;

    this.roomService.getLandlordRooms(queryParam).subscribe({
      next: (res: any) => {
        this.rooms = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.roomsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.rooms = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.roomsLoading = false;
        console.error('Lỗi lấy danh sách phòng: ', err);
        this.cdr.detectChanges();
      },
    });
  }

  onFilterChange() {
    this.filter.page = 0;
    this.loadRooms();
  }
  loadHostelOptions() {
    this.hostelOptionsLoading = true;
    this.roomService.getLandlordHostels({ page: 0, size: 1000 }).subscribe({
      next: (res: any) => {
        this.hostelOptions = Array.isArray(res) ? res : (res?.content ?? []);
        this.hostelOptionsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi lấy danh sách hostel: ', err);
        this.hostelOptions = [];
        this.hostelOptionsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
  loadProvinces() {
    this.http.get('https://provinces.open-api.vn/api/p/').subscribe((res: any) => {
      this.provinces = res;
    });
  }

  onProvinceChange() {
    this.newHostel.districtCode = '';
    this.newHostel.wardCode = '';
    this.districts = [];
    this.wards = [];
    this.isDistrictLoading = false;
    this.isWardLoading = false;
    if (this.newHostel.cityCode) {
      const selectedProvince = this.provinces.find((p) => p.code == this.newHostel.cityCode);
      if (selectedProvince) this.newHostel.city = selectedProvince.name;

      this.isDistrictLoading = true;
      this.http
        .get(`https://provinces.open-api.vn/api/p/${this.newHostel.cityCode}?depth=2`)
        .subscribe(
          (res: any) => {
            this.districts = res.districts;
            this.isDistrictLoading = false;
            this.cdr.detectChanges();
          },
          () => {
            this.isDistrictLoading = false;
            this.cdr.detectChanges();
          },
        );
    }
  }
  onDistrictChange() {
    this.newHostel.wardCode = '';
    this.wards = [];
    this.isWardLoading = false;
    if (this.newHostel.districtCode) {
      const selectDist = this.districts.find((n) => n.code == this.newHostel.districtCode);
      if (selectDist) this.newHostel.district = selectDist.name;
      this.isWardLoading = true;
      this.http
        .get(`https://provinces.open-api.vn/api/d/${this.newHostel.districtCode}?depth=2`)
        .subscribe(
          (res: any) => {
            this.wards = res.wards;
            this.isWardLoading = false;
            this.cdr.detectChanges();
          },
          () => {
            this.isWardLoading = false;
            this.cdr.detectChanges();
          },
        );
    }
  }

  onWardChange() {
    if (this.newHostel.wardCode) {
      const selectWard = this.wards.find((n) => n.code == this.newHostel.wardCode);
      if (selectWard) this.newHostel.ward = selectWard.name;
    }
  }

  setViewMode(mode: 'rooms' | 'hostels') {
    this.viewMode = mode;
    if (mode == 'hostels' && !this.hostelsLoaded && !this.hostelsLoading) {
      this.loadHostels();
    }
  }

  loadHostels() {
    this.hostelsLoading = true;
    const queryParam: any = {
      page: this.hostelFilter.page,
      size: this.hostelFilter.size,
    };

    if (this.hostelKeyword.trim()) {
      queryParam.keyword = this.hostelKeyword.trim();
    }

    this.roomService.getLandlordHostels(queryParam).subscribe({
      next: (res: any) => {
        this.hostels = Array.isArray(res) ? res : (res?.content ?? []);
        this.hostelTotalElements = res?.totalElements ?? this.hostels.length;
        this.hostelTotalPages = res?.totalPages;
        this.hostelsLoaded = true;
        this.hostelsLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi lấy danh sách tòa nhà: ', error);
        this.hostels = [];
        this.hostelTotalElements = 0;
        this.hostelTotalPages = 0;
        this.hostelsLoaded = false;
        this.hostelsLoading = false;
        this.toastr.error('Không tải được danh sách tòa nhà.', 'Lỗi');
        this.cdr.detectChanges();
      },
    });
  }
  applyHostelFilter() {
    this.hostelFilter.page = 0;
    this.loadHostels();
  }

  changeHostelPage(newPage: number) {
    if (newPage >= 0 && newPage < this.hostelTotalPages) {
      this.hostelFilter.page = newPage;
      this.loadHostels();
    }
  }
  getHostelAddress(hostel: any): string {
    const parts = [hostel.addressDetail, hostel.ward, hostel.district, hostel.city].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Chưa cập nhật';
  }

  openHostelModal() {
    this.isHostelModalOpen = true;
    this.isSubmittingHostel = false;
    this.newHostel = {
      name: '',
      cityCode: '',
      districtCode: '',
      wardCode: '',
      addressDetail: '',
      description: '',
    };
  }

  onHostelOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeHostelModal();
    }
  }
  closeHostelModal() {
    this.isHostelModalOpen = false;
    this.isSubmittingHostel = false;
    this.selectedFiles = [];
    this.imagePreviews = [];
  }

  onSubmitRoom() {
    if (this.isSubmittingRoom) {
      return;
    }
    if (this.roomSelectedFiles.length === 0) {
      this.toastr.warning('Vui lòng upload ít nhất 1 ảnh phòng!');
      return;
    }
    const roomPayload = {
      hostelId: this.newRoom.hostelId,
      roomName: this.newRoom.roomName?.trim(),
      basePrice:
        this.newRoom.basePrice === null || this.newRoom.basePrice === ''
          ? null
          : Number(this.newRoom.basePrice),
      area:
        this.newRoom.area === null || this.newRoom.area === '' ? null : Number(this.newRoom.area),
      floor:
        this.newRoom.floor === null || this.newRoom.floor === ''
          ? null
          : Number(this.newRoom.floor),
      bathCount:
        this.newRoom.bathCount === null || this.newRoom.bathCount === ''
          ? null
          : Number(this.newRoom.bathCount),
      bedType: this.newRoom.bedType,
      status: this.newRoom.status,
    };
    const formData = new FormData();
    formData.append('rooms', JSON.stringify(roomPayload));

    for (const file of this.roomSelectedFiles) {
      formData.append('images', file);
    }

    this.isSubmittingRoom = true;
    this.cdr.detectChanges();
    this.roomService.createRoom(formData).subscribe({
      next: () => {
        this.isSubmittingRoom = false;
        this.toastr.success('Thêm phòng thành công');
        this.closeRoomModal();
        this.loadRooms();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmittingRoom = false;
        console.error('Thêm phòng lỗi:', err);
        this.toastr.error('Có lỗi xảy ra khi thêm phòng');
        this.cdr.detectChanges();
      },
    });
  }
  onSubmitHostel() {}
}
