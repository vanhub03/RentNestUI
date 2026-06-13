import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TenantRoomService } from '../_services/tenant-room.service';
import { StorageService } from '../_services/storage.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tenant-invoices',
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-rooms.component.html',
  styleUrl: './tenant-rooms.component.scss',
})
export class TenantRoomsComponent implements OnInit {
  rooms: any[] = []; //danh sach phong dang thue backend tra ve
  selectedRoom: any = null; //phong dang mo modal them nguoi o cung
  isLoading = true;
  isSavingOccupant = false; //loading khi them nguoi o cung
  occupantForm: any = this.emptyOccupantForm();
  cccdFrontFile: File | null = null;
  cccdBackFile: File | null = null;

  constructor(
    private tenantRoomService: TenantRoomService, //goi api phong dang thue
    private storageService: StorageService, //kiem tra tenant da login chua
    private toastr: ToastrService, //hien thi thong bao
    private router: Router, //dieu huong ve login
    private cdr: ChangeDetectorRef, //cap nhap UI
  ) {}
  ngOnInit(): void {
    if (!this.storageService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-rooms' } });
      return;
    }
    this.loadRooms();
  }
  loadRooms(): void {
    //load danh sách phòng đang thuê
    this.isLoading = true; // set loading
    this.tenantRoomService.getMyRoom().subscribe({
      //call api để lấy danh sách phòng đang thuê
      next: (res) => {
        //nếu thành công
        this.rooms = res || []; //gắn rooms = kết quả api trả về -> rooms sẽ chứa danh sách phòng dang thuê
        this.isLoading = false; //tắt loading
        this.cdr.detectChanges(); //báo angular re-gen lại UI
      },
      error: () => {
        // nếu mà lỗi
        this.rooms = []; //set rooms = mảng rỗng
        this.isLoading = false; //tắt loading
        this.toastr.error('Không tải được danh sách phòng đang thuê'); //hiển thị thông báo lỗi
        this.cdr.detectChanges(); //báo angular re-gen lại UI
      },
    });
  }

  getThumbnail(room: any): string {
    //lấy ảnh phòng để hiển thị
    return (
      room.thumbnailUrl ||
      'https://images.unsplash.com/photo-1555541170-1361cddf01d0?w=600&auto=format&fit=crop'
    );
  }
  openOccupantModal(room: any) {
    this.selectedRoom = room;
    this.occupantForm = this.emptyOccupantForm();
    this.cccdBackFile = null;
    this.cccdFrontFile = null;
  }

  closeOccupantModal() {
    if (this.isSavingOccupant) {
      return;
    }
    this.selectedRoom = null;
  }

  emptyOccupantForm(): any {
    return {
      fullName: '',
      phoneNumber: '',
      identityCard: '',
      identityCardFrontUrl: '',
      identityCardBackUl: '',
    };
  }

  onCccdFrontChange(event: Event): void{
    this.cccdFrontFile = this.readSelectedImage(event);
  }
  onCccdBackChange(event: Event): void{
    this.cccdBackFile = this.readSelectedImage(event);
  }

  private readSelectedImage(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if(!file){
      return null;
    }
    if(!file.type.startsWith('image/')){
      this.toastr.warning('File cccd phai la hinh anh')
      return null;
    }
    return file
  }

  addCoOccupant(): void {
    if (!this.selectedRoom?.roomId) {
      //khong co phong thi khong xu ly
      return;
    }
    if (!this.occupantForm.fullName || !this.occupantForm.phoneNumber) {
      this.toastr.warning('Vui lòng nhập họ tên và số điện thoại người ở cùng');
      return;
    }
    if(!this.cccdFrontFile || !this.cccdBackFile){
      this.toastr.warning('Vui long upload anh CCCD mat truoc va mat sau');
      return;
    }

    this.isSavingOccupant = true;
    const formData = new FormData();
    const data = {
      fullName: this.occupantForm.fullName,
      phoneNumber: this.occupantForm.phoneNumber,
      identityCard: this.occupantForm.identityCard
    }
    formData.append('data', JSON.stringify(data));
    formData.append('cccdFront', this.cccdFrontFile as File);
    formData.append('cccdBack', this.cccdBackFile as File);
    this.tenantRoomService.addCoOccupant(this.selectedRoom.roomId, formData).subscribe({
      next: (res) => {
        this.rooms = this.rooms.map((room) => (room.roomId === res.roomId ? res : room)); //cap nhat lai phong trong danh sach
        this.selectedRoom = res; //cap nhap modal bang dach sach ocuupant tra ve
        this.occupantForm = this.emptyOccupantForm(); //reset form ve blank
        this.cccdFrontFile = null;
        this.cccdBackFile = null
        this.isSavingOccupant = false; //tat loading
        this.toastr.success('Đã khai báo thêm người ở cùng');
        this.closeOccupantModal();
        this.cdr.detectChanges(); //bao angular re-gen lai UI
      },
      error: (err) => {
        this.isSavingOccupant = false;
        this.toastr.error(
          err.error?.message || err.error || 'Khai báo người ở cùng không thành công',
        );
        this.cdr.detectChanges();
      },
    });
  }
}
