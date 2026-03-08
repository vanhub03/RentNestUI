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
  constructor(
    private roomService: RoomService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private http: HttpClient,
  ) {}
  ngOnInit(): void {
    this.loadHostels();
    this.loadProvinces();
  }
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  isDistrictLoading = false;
  isWardLoading = false;
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
}
