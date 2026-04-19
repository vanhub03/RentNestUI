import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../_services/room.service';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../_services/storage.service';
import { BookingService } from '../_services/booking.service';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.scss',
})
export class RoomDetailComponent implements OnInit {
  roomId!: number;
  isLoading = true;
  room: any = null;
  isBookingModalOpen = false;
  bookingForm = {
    fullName: '',
    phone: '',
    cccd: '',
    email: '',
    moveInDate: '',
    message: '',
  };
  isGalleryOpen = false;
  currentImageIndex = 0;
  today!: string;
  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private router: Router,
    private bookingService: BookingService,
  ) {}
  ngOnInit(): void {
    const now = new Date();
    this.today = now.toISOString().split('T')[0]; // yyyy-MM-dd
    this.route.params.subscribe((params) => {
      this.roomId = Number(params['id']);
      this.loadRoomDetail();
      this.loadBookingUserInfor();
    });
  }
  user: any;
  loadBookingUserInfor() {
    this.user = this.storageService.getUser();
    this.bookingForm = {
      fullName: this.user.fullName,
      phone: this.user.phoneNumber,
      cccd: '',
      email: this.user.email,
      moveInDate: '',
      message: '',
    };
    console.log(this.user);
  }
  openGallery(index: number) {
    if (this.room && this.room.images && this.room.images.length > 0) {
      this.currentImageIndex = index;
      this.isGalleryOpen = true;
      document.body.style.overflow = 'hidden'; // khóa cuộn chuột trang web khi mở modal
    }
  }
  closeGallery() {
    this.isGalleryOpen = false;
    document.body.style.overflow = 'auto'; //mở lại cuộn chuột
  }
  nextImage(event?: Event) {
    if (event) event.stopPropagation(); // Ngăn sự kiện click lan ra ngoài làm đóng modal
    if (this.currentImageIndex < this.room.images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }
  prevImage(event?: Event) {
    if (event) event.stopPropagation();
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.room.images.length - 1;
    }
  }
  loadRoomDetail(): void {
    this.isLoading = true;
    this.roomService.getRoomDetail(this.roomId).subscribe({
      next: (res) => {
        this.room = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Không tải được thông tin phòng');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
  backUrl: string = '';
  openBookingModal() {
    if (this.storageService.isLoggedIn()) {
      this.isBookingModalOpen = true;
      document.body.style.overflow = 'hidden';
      //load thong tin user
    } else {
      this.backUrl = this.router.url;
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.backUrl } });
    }
  }
  closeBookingModal() {
    this.isBookingModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  submitBooking() {
    const bookingPayload = {
      roomId: this.roomId,
      userId: this.user.id,
      cccd: this.bookingForm.cccd,
      expectedMoveInDate: this.bookingForm.moveInDate,
      notes: this.bookingForm.message,
    };
    console.log(bookingPayload);
    this.bookingService.postRequestRentRoom(bookingPayload).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.closeBookingModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Request thuê phòng lỗi:', err);
        this.toastr.error('Có lỗi xảy ra khi đặt lịch thuê phòng');
        this.cdr.detectChanges();
      },
    });
  }
}
